<?php

namespace App\Domain;

use App\Jobs\SendNotification;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\NotificationOutbox;
use App\Models\OwnerSetting;
use App\Models\PatientAccess;
use App\Models\TeleServiceLink;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class Notifications
{
    public function fanOut(): int
    {
        $count = 0;
        foreach (NotificationOutbox::whereNull('dispatched_at')->where(fn ($q) => $q->whereNull('available_at')->orWhere('available_at', '<=', now()))->orderBy('created_at')->limit(100)->pluck('id') as $id) {
            DB::transaction(function () use ($id, &$count) {
                $event = NotificationOutbox::whereKey($id)->lockForUpdate()->firstOrFail();
                if ($event->dispatched_at) {
                    return;
                }
                $payload = $event->payload;
                $recipientIds = [];
                if (isset($payload['patient_id'])) {
                    $recipientIds = PatientAccess::where('patient_id', $payload['patient_id'])->where('status', 'ACTIVE')->pluck('account_user_id')->all();
                }
                if (isset($payload['recipient_user_id'])) {
                    $recipientIds[] = $payload['recipient_user_id'];
                }
                if (in_array($event->event_type, ['CREATED', 'PAYMENT_SUBMITTED', 'PAYMENT_CORRECTED', 'TELE_NEEDS_LINK', 'NO_SHOW_REVIEW_REQUIRED', 'RESCHEDULE_REQUESTED'], true)) {
                    $recipientIds = [...$recipientIds, ...User::where('role', 'ADMIN')->where('status', 'ACTIVE')->pluck('id')->all()];
                }
                $owner = OwnerSetting::first();
                if ($owner && in_array($event->event_type, ['RESCHEDULED', 'CALENDAR_CHANGED', 'CANCELLED', 'PAYMENT_REJECTED', 'TELE_NEEDS_LINK', 'CUSTOM_CREATED', 'CONTINUATION', 'NO_SHOW_REVIEW_REQUIRED'], true)) {
                    $recipientIds[] = $owner->owner_user_id;
                }
                if (in_array($event->event_type, ['REMINDER_OWNER', 'DAILY_OWNER'], true)) {
                    $recipientIds = $owner ? [$owner->owner_user_id] : [];
                }
                foreach (array_unique($recipientIds) as $recipient) {
                    Notification::firstOrCreate(['deduplication_key' => $event->id.':in:'.$recipient], ['outbox_id' => $event->id, 'recipient_user_id' => $recipient, 'channel' => 'IN_APP', 'template_key' => $event->event_type, 'status' => 'SENT', 'attempt_count' => 0, 'sent_at' => now()]);
                }
                if (in_array($event->event_type, ['CREATED', 'CUSTOM_CREATED', 'CONTINUATION', 'REMINDER_OWNER', 'DAILY_OWNER', 'RESCHEDULED', 'CALENDAR_CHANGED', 'CANCELLED'], true) && $owner) {
                    $this->queue($event, $owner->owner_user_id, User::find($owner->owner_user_id)?->phone, null);
                }
                if (in_array($event->event_type, ['REMINDER_PATIENT', 'RESCHEDULED', 'CALENDAR_CHANGED', 'CANCELLED'], true) && $event->resource_type === 'appointments') {
                    $appointment = Appointment::find($event->resource_id);
                    if ($appointment?->reminder_wa_accepted_at && $appointment->reminder_recipient_phone) {
                        $this->queue($event, $appointment->responsible_user_id, $appointment->reminder_recipient_phone, null, 'patient');
                    }
                }
                if ($event->event_type === 'TELE_LINK_READY') {
                    $link = TeleServiceLink::find($payload['link_id'] ?? '');
                    if ($link) {
                        $this->queue($event, $link->recipient_user_id, $link->recipient_phone, $link->id);
                    }
                }
                $event->update(['dispatched_at' => now()]);
                $count++;
            }, 5);
        }

        return $count;
    }

    private function queue(NotificationOutbox $event, ?string $recipient, ?string $phone, ?string $link, string $audience = 'owner'): void
    {
        // Null owner number is an explicit placeholder, never a guessed phone number.
        $notification = Notification::firstOrCreate(['deduplication_key' => $event->id.':wa:'.$audience.($link ? ':'.$link : '')], ['outbox_id' => $event->id, 'recipient_user_id' => $recipient,
            'recipient_phone_snapshot' => $phone ?? '[WHATSAPP_BELUM_DIISI]', 'tele_service_link_id' => $link, 'channel' => 'WHATSAPP', 'template_key' => $event->event_type, 'status' => 'QUEUED', 'attempt_count' => 0]);
        SendNotification::dispatch($notification->id)->afterCommit();
    }

    public function send(string $id): void
    {
        $lock = Cache::lock('wa-send:'.$id, 45);
        if (! $lock->get()) {
            throw new \RuntimeException('Pengiriman sedang diproses.');
        }
        try {
            $this->deliver($id);
        } finally {
            $lock->release();
        }
    }

    private function deliver(string $id): void
    {
        $notification = Notification::findOrFail($id);
        if (in_array($notification->status->value, ['SENT', 'CANCELLED'], true)) {
            return;
        }
        $event = NotificationOutbox::findOrFail($notification->outbox_id);
        $payload = $event->payload;
        $ownerId = OwnerSetting::firstOrFail()->owner_user_id;
        $patientAudience = str_ends_with($notification->deduplication_key, ':wa:patient');
        $phone = $notification->tele_service_link_id ? $notification->recipient_phone_snapshot : ($patientAudience ? null : User::whereKey($ownerId)->where('status', 'ACTIVE')->value('phone'));
        $text = '';
        if ($event->resource_type === 'appointments') {
            $appointment = Appointment::find($event->resource_id);
            $change = in_array($event->event_type, ['RESCHEDULED', 'CALENDAR_CHANGED', 'CANCELLED'], true);
            if (! $appointment || (! $change && (in_array($appointment->status->value, ['CANCELLED', 'EXPIRED', 'COMPLETED'], true) || $appointment->requires_reschedule))) {
                $notification->update(['status' => 'CANCELLED']);

                return;
            }
            $expectedAttempt = $payload['attempt_number'] ?? $appointment->attempt_number;
            if ($appointment->attempt_number !== $expectedAttempt) {
                $notification->update(['status' => 'CANCELLED']);

                return;
            }
            if (in_array($event->event_type, ['REMINDER_OWNER', 'REMINDER_PATIENT'], true) && (! $appointment->start_at->isFuture() || in_array($appointment->status->value, ['CHECKED_IN', 'IN_CONSULTATION', 'NO_SHOW'], true))) {
                $notification->update(['status' => 'CANCELLED']);

                return;
            }
            if ($patientAudience) {
                if (! $appointment->reminder_wa_accepted_at || ! $appointment->reminder_recipient_phone) {
                    $notification->update(['status' => 'CANCELLED']);

                    return;
                }
                $phone = $appointment->reminder_recipient_phone;
            }
            $heading = match ($event->event_type) {
                'CREATED','CUSTOM_CREATED','CONTINUATION' => 'Jadwal baru','RESCHEDULED' => 'Jadwal diubah','CALENDAR_CHANGED' => 'Perubahan jam klinik; perlu jadwal pengganti','CANCELLED' => 'Janji dibatalkan',default => 'Pengingat jadwal'
            };
            $text = 'JiwaSehat — '.$heading.' — '.$appointment->booking_code.' — '.$appointment->start_at->setTimezone('Asia/Jakarta')->format('d/m/Y H:i').' WIB';
            if (! $patientAudience && ! $notification->tele_service_link_id) {
                $text .= "\nPasien: ".($appointment->identity_snapshot['full_name'] ?? $appointment->patient?->full_name ?? 'Lihat dashboard');
            }
            if ($notification->tele_service_link_id) {
                $link = TeleServiceLink::findOrFail($notification->tele_service_link_id);
                $latest = TeleServiceLink::where('appointment_id', $appointment->id)->where('attempt_number', $appointment->attempt_number)->max('version');
                if ($link->attempt_number !== $appointment->attempt_number || $link->version !== $latest) {
                    $notification->update(['status' => 'CANCELLED']);

                    return;
                }
                $text .= "\nTautan Google Meet: ".$link->meeting_url;
            } else {
                $text .= "\nPengingat jadwal. Detail: ".route('dashboard');
            }
        } else {
            $text = 'JiwaSehat — ringkasan jadwal tersedia di '.route('dashboard');
        }
        if (config('integrations.whatsapp.driver') !== 'baileys' || ! preg_match('/^\+[1-9][0-9]{7,14}$/D', $phone ?? '')) {
            $notification->update(['status' => 'FAILED', 'last_error' => 'WHATSAPP_PLACEHOLDER: nomor/provider belum diaktifkan']);

            return;
        }
        $frozen = $notification->delivery_payload;
        if ($frozen && $frozen['phone'] !== $phone) {
            $notification->update(['status' => 'CANCELLED', 'last_error' => 'Nomor berubah sesudah percobaan. Periksa riwayat pengiriman.']);

            return;
        }
        $body = $frozen ?? ['id' => $notification->id, 'phone' => $phone, 'text' => $text];
        if (! $frozen) {
            $notification->update(['delivery_payload' => $body, 'recipient_phone_snapshot' => $phone]);
        }
        $notification->update(['status' => 'SENDING', 'attempt_count' => $notification->attempt_count + 1]);
        try {
            $response = app(WhatsAppBridge::class)->request('/messages', $body);
            if ($response->status() === 409) {
                $notification->refresh()->update(['status' => 'FAILED', 'last_error' => 'Hasil kirim perlu rekonsiliasi di WhatsApp; jangan buat pengiriman baru.']);

                return;
            }
            $response->throw();
            if (! is_string($response->json('id')) || ! filled($response->json('id'))) {
                throw new \RuntimeException('Provider tidak memberi acknowledgement.');
            }
            $notification->refresh()->update(['status' => 'SENT', 'sent_at' => now(), 'provider_reference' => (string) $response->json('id'), 'last_error' => null]);
        } catch (\Throwable $error) {
            $notification->refresh()->update(['status' => 'RETRY', 'next_retry_at' => now()->addMinutes(5), 'last_error' => 'Kanal pengiriman gagal; periksa bridge.']);
            throw $error;
        }
    }
}
