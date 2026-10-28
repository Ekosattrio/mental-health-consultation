<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Operations;
use App\Domain\Phone;
use App\Domain\Transactions;
use App\Domain\WhatsAppBridge;
use App\Jobs\SendNotification;
use App\Models\Notification;
use App\Models\TeleServiceLink;
use Illuminate\Http\Request;

final class NotificationController extends DomainController
{
    public function status(Request $request): mixed
    {
        Access::requireOwner($request->user());
        $status = ['ready' => false, 'state' => 'BRIDGE_UNREACHABLE'];
        try {
            $response = app(WhatsAppBridge::class)->request('/status');
            if ($response->successful()) {
                $status = $response->json();
            }
        } catch (\Throwable) {
        }

        return response()->json(['data' => [...$status, 'sender_phone' => config('integrations.whatsapp.sender_phone'), 'owner_phone' => $request->user()->phone]])->header('Cache-Control', 'no-store, private');
    }

    public function pairing(Request $request): mixed
    {
        Access::requireOwner($request->user());
        try {
            $response = app(WhatsAppBridge::class)->request('/pairing')->throw();

            return response()->json(['data' => $response->json()])->header('Cache-Control', 'no-store, private');
        } catch (\Throwable) {
            return response()->json(['message' => 'Bridge belum siap. Jalankan bridge lalu coba kembali.'], 503);
        }
    }

    public function contact(Request $request, string $appointment): mixed
    {
        $input = $request->validate(['recipient_phone' => 'nullable|string|max:25', 'accepted' => 'required|boolean', 'expected_version' => 'required|integer|min:1']);

        return $this->execute($request, 'reminder.contact.'.$appointment, $input, function () use ($request, $appointment, $input) {
            $record = app(Operations::class)->lock($appointment);
            Access::patient($request->user(), $record->patient_id);
            $this->version($record, $input['expected_version']);
            Access::check($record->start_at->isFuture() && ! in_array($record->status->value, ['CANCELLED', 'EXPIRED', 'COMPLETED'], true), 'Kontak hanya dapat diubah untuk jadwal mendatang aktif.');
            $phone = $input['accepted'] ? Phone::normalize($input['recipient_phone'] ?? null) : null;
            Access::check(! $input['accepted'] || filled($phone), 'Nomor penerima wajib.');
            $record->update(['reminder_recipient_phone' => $phone, 'reminder_wa_accepted_at' => $input['accepted'] ? now() : null]);
            Transactions::audit($request->user(), 'reminder.contact', 'appointments', $record->id, ['accepted' => $input['accepted']]);

            return ['id' => $record->id];
        });
    }

    public function meet(Request $request, string $appointment): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['meeting_url' => 'required|url|max:1000', 'recipient_phone' => 'required|string|max:25', 'recipient_confirmed' => 'accepted', 'expected_version' => 'required|integer|min:1', 'expected_link_version' => 'required|integer|min:0', 'reason' => 'required|string|min:3|max:500']);
        $input['recipient_phone']=\App\Domain\Phone::normalize($input['recipient_phone']);
        Access::check((bool) preg_match('~^https://meet\.google\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}$~D', $input['meeting_url']), 'Gunakan link ruang Google Meet yang valid, tanpa parameter tambahan.');

        return $this->execute($request, 'meet.save.'.$appointment, $input, function () use ($request, $appointment, $input) {
            $record = app(Operations::class)->lock($appointment);
            $this->version($record, $input['expected_version']);
            Access::check($record->packageVersion?->delivery_mode->value === 'TELE_SERVICE' && ! in_array($record->status->value, ['CANCELLED', 'EXPIRED', 'COMPLETED'], true), 'Booking bukan Telelayanan aktif.');
            $version = (int) TeleServiceLink::where('appointment_id', $appointment)->where('attempt_number', $record->attempt_number)->max('version');
            Access::check($version === $input['expected_link_version'], 'Versi link berubah.');
            $link = TeleServiceLink::create(['appointment_id' => $appointment, 'attempt_number' => $record->attempt_number, 'version' => $version + 1, 'meeting_url' => $input['meeting_url'], 'recipient_phone' => $input['recipient_phone'], 'recipient_user_id' => $record->responsible_user_id, 'recipient_confirmed_at' => now(), 'created_by' => $request->user()->id, 'reason' => $input['reason']]);
            Transactions::outbox('TELE_LINK_READY', 'appointments', $appointment, ['link_id' => $link->id, 'attempt_number' => $record->attempt_number], $link->version);
            Transactions::audit($request->user(), 'meet.version', 'tele_service_links', $link->id, ['appointment_id' => $appointment, 'version' => $link->version], $input['reason']);

            return ['id' => $link->id, 'status' => 'QUEUED'];
        });
    }

    public function read(Request $request, string $notification): mixed
    {
        $input = [];

        return $this->execute($request, 'notification.read.'.$notification, $input, function () use ($request, $notification) {
            $record = Notification::whereKey($notification)->where('recipient_user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            $record->update(['read_at' => now()]);

            return ['id' => $record->id];
        });
    }

    public function retry(Request $request, string $notification): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'notification.retry.'.$notification, $input, function () use ($request, $notification, $input) {
            $record = Notification::whereKey($notification)->where('channel', 'WHATSAPP')->lockForUpdate()->firstOrFail();
            Access::check(in_array($record->status->value, ['FAILED', 'RETRY'], true), 'Pengiriman tidak dalam keadaan gagal.');
            $record->update(['status' => 'QUEUED', 'attempt_count' => 0, 'last_error' => null]);
            SendNotification::dispatch($record->id)->afterCommit();
            Transactions::audit($request->user(), 'notification.retry', 'notifications', $record->id, [], $input['reason']);

            return ['id' => $record->id];
        });
    }
}
