<?php

namespace App\Domain;

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\AssessmentCase;
use App\Models\BillingAccount;
use App\Models\CalendarVersion;
use App\Models\CmsContent;
use App\Models\ConsultationPackage;
use App\Models\OperationalChange;
use App\Models\OperationalChangeImpact;
use App\Models\OwnerSetting;
use App\Models\PackageVersion;
use App\Models\PatientAccess;
use App\Models\PatientProfile;
use App\Models\RescheduleRequest;
use App\Models\Review;
use App\Models\ScheduleOverride;
use App\Models\ScheduleOverrideInterval;
use App\Models\User;
use App\Models\WeeklySchedule;
use App\Models\WeeklyScheduleLimit;
use Carbon\CarbonImmutable;

final class Administration
{
    public function profile(User $actor, array $input, ?PatientProfile $profile = null): PatientProfile
    {
        if ($profile) {
            Access::patient($actor, $profile->id);
            $profile->update($input);
        } else {
            $profile = PatientProfile::create($input);
            if ($actor->role === UserRole::Patient) {
                PatientAccess::create(['account_user_id' => $actor->id, 'patient_id' => $profile->id, 'relationship' => 'SELF', 'verified_by' => $actor->id, 'verified_at' => now()]);
            }
        }
        Transactions::audit($actor, 'patient.profile', 'patient_profiles', $profile->id);

        return $profile;
    }

    public function package(User $actor, array $input): PackageVersion
    {
        Access::requireStaff($actor);
        $package = isset($input['package_id']) ? ConsultationPackage::whereKey($input['package_id'])->lockForUpdate()->firstOrFail() : ConsultationPackage::create(['service_code' => $input['service_code'], 'category' => $input['category'], 'created_by' => $actor->id]);
        $category = $package->category->value;
        foreach (['promo_starts_at', 'promo_ends_at'] as $timeField) {
            if (! empty($input[$timeField])) {
                $input[$timeField] = app(Calendar::class)->instant($input[$timeField]);
            }
        }
        Access::check($input['normal_price'] > 0 && (! isset($input['promo_price']) || $input['promo_price'] > 0 && $input['promo_price'] < $input['normal_price']), 'Harga/promo tidak sah.');
        Access::check(! ($input['is_bookable'] ?? false) || (($input['duration_minutes'] ?? 0) > 0 && ($category !== 'COUNSELING' || filled($input['additional_time_price_basis'] ?? null))), 'Durasi dan basis overtime Konseling wajib sebelum bookable.');
        if (isset($input['promo_starts_at'],$input['promo_ends_at'])) {
            Access::check(CarbonImmutable::parse($input['promo_ends_at'])->greaterThan(CarbonImmutable::parse($input['promo_starts_at'])), 'Akhir promo harus setelah awal.');
        }
        $version = PackageVersion::create([...array_intersect_key($input, array_flip(['name', 'description', 'variant', 'delivery_mode', 'duration_minutes', 'duration_min_minutes', 'duration_max_minutes', 'normal_price', 'promo_price', 'promo_starts_at', 'promo_ends_at', 'additional_time_price_basis', 'benefits', 'is_bookable'])),
            'package_id' => $package->id, 'version' => (int) PackageVersion::where('package_id', $package->id)->max('version') + 1, 'effective_at' => now(), 'created_by' => $actor->id,
            'billing_mode' => match ($category) {
                'ASSESSMENT' => 'PER_PACKAGE','PSYCHOTHERAPY' => 'PER_SESSION',default => 'PER_APPOINTMENT'
            }, 'minimum_sessions' => $category === 'PSYCHOTHERAPY' ? 4 : 1, 'includes_result_report' => $category === 'ASSESSMENT', 'requires_evaluation' => $package->service_code === 'ASSESSMENT_BASIC']);
        Transactions::bump($package);
        Transactions::audit($actor, 'catalog.version', 'consultation_packages', $package->id, ['version_id' => $version->id], $input['reason']);

        return $version;
    }

    private function normalizedCalendar(array $input): array
    {
        $weekly = $input['weekly'];
        $days = [];
        foreach ($weekly as &$day) {
            Access::check(! in_array($day['day_of_week'], $days, true), 'Hari kalender duplikat.');
            $days[] = $day['day_of_week'];
            $day['intervals'] = $this->intervals($day['intervals']);
            Access::check(! $day['intervals'] || $day['daily_limit'] > 0, 'Kuota hari buka harus positif.');
        }
        $overrides = $input['overrides'] ?? [];
        $dates = [];
        foreach ($overrides as &$override) {
            Access::check(! in_array($override['local_date'], $dates, true), 'Override tanggal duplikat.');
            $dates[] = $override['local_date'];
            $override['intervals'] = $override['mode'] === 'CLOSED' ? [] : $this->intervals($override['intervals']);
            Access::check($override['mode'] === 'CLOSED' || ($override['daily_limit'] > 0 && count($override['intervals']) > 0), 'Pembukaan khusus wajib jam/kuota.');
        }

        return ['weekly' => $weekly, 'overrides' => $overrides];
    }

    private function intervals(array $rows): array
    {
        usort($rows, fn ($a, $b) => strcmp($a[0], $b[0]));
        $last = '00:00';
        foreach ($rows as $row) {
            Access::check(count($row) === 2 && preg_match('/^([01]\d|2[0-3]):[0-5]\d$/D', $row[0]) && preg_match('/^([01]\d|2[0-3]):[0-5]\d$/D', $row[1]) && $row[0] < $row[1] && $row[0] >= $last, 'Interval kalender tidak sah/overlap.');
            $last = $row[1];
        }

        return $rows;
    }

    public function calendar(User $actor, array $input, bool $apply = false): array
    {
        Access::requireStaff($actor);
        $normalized = $this->normalizedCalendar($input);
        $calendar = app(Calendar::class);
        $current = $calendar->version();
        Access::check($input['calendar_version_id'] === $current->id, 'Versi kalender berubah.');
        $appointments = Appointment::whereIn('status', Calendar::OCCUPYING)->where('start_at', '>', now())->orderBy('id')->get();
        $affected = $appointments->filter(function ($appointment) use ($normalized, $calendar) {
            $date = $appointment->start_at->setTimezone('Asia/Jakarta')->toDateString();
            $override = collect($normalized['overrides'])->firstWhere('local_date', $date);
            $day = $override ?? collect($normalized['weekly'])->firstWhere('day_of_week', $appointment->start_at->setTimezone('Asia/Jakarta')->dayOfWeekIso);
            $rows = $day['intervals'] ?? [];

            return ! collect($rows)->contains(fn ($row) => $appointment->start_at->greaterThanOrEqualTo($calendar->instant($date.' '.$row[0])) && $appointment->end_at->lessThanOrEqualTo($calendar->instant($date.' '.$row[1])));
        });
        $hash = hash_hmac('sha256', json_encode([$current->id, $normalized, $appointments->map(fn ($a) => [$a->id, $a->row_version])->all()], JSON_THROW_ON_ERROR), config('app.key'));
        if (! $apply) {
            return ['preview_token' => $hash, 'affected' => $affected->map(fn ($a) => ['id' => $a->id, 'booking_code' => $a->booking_code, 'start_at' => $a->start_at->toIso8601String()])->values()->all()];
        }
        Access::check(isset($input['preview_token']) && hash_equals($hash, $input['preview_token']), 'Dampak kalender berubah; preview ulang.');
        $calendar->lock($calendar->settings()->owner_user_id, $appointments->map(fn ($a) => $a->start_at->setTimezone('Asia/Jakarta')->toDateString())->push(CarbonImmutable::now('Asia/Jakarta')->toDateString())->all());
        $currentAppointments = Appointment::whereIn('status', Calendar::OCCUPYING)->where('start_at', '>', now())->orderBy('id')->get();
        Access::check($currentAppointments->map(fn ($a) => [$a->id, $a->row_version])->all() === $appointments->map(fn ($a) => [$a->id, $a->row_version])->all(), 'Daftar appointment berubah; preview ulang.');
        // All writes use the calendar mutex date; re-read after obtaining it.
        $latest = $calendar->version();
        Access::check($latest->id === $current->id, 'Kalender baru telah diterbitkan; preview ulang.');
        foreach ($appointments as $read) {
            $fresh = Appointment::whereKey($read->id)->lockForUpdate()->firstOrFail();
            Access::check($fresh->row_version === $read->row_version, 'Appointment berubah; preview ulang.');
        }
        $version = CalendarVersion::create(['version' => $current->version + 1, 'effective_at' => now(), 'created_by' => $actor->id, 'reason' => $input['reason']]);
        foreach ($normalized['weekly'] as $day) {
            WeeklyScheduleLimit::create(['calendar_version_id' => $version->id, 'day_of_week' => $day['day_of_week'], 'daily_limit' => $day['daily_limit'] ?: 1]);
            foreach ($day['intervals'] as [$start,$end]) {
                WeeklySchedule::create(['calendar_version_id' => $version->id, 'day_of_week' => $day['day_of_week'], 'start_time' => $start, 'end_time' => $end]);
            }
        }
        foreach ($normalized['overrides'] as $day) {
            $override = ScheduleOverride::create(['calendar_version_id' => $version->id, 'local_date' => $day['local_date'], 'mode' => $day['mode'], 'daily_limit' => $day['mode'] === 'CLOSED' ? 0 : $day['daily_limit'], 'reason' => $day['reason']]);
            foreach ($day['intervals'] as [$start,$end]) {
                ScheduleOverrideInterval::create(['override_id' => $override->id, 'start_time' => $start, 'end_time' => $end]);
            }
        }
        $change = OperationalChange::create(['calendar_version_id' => $version->id, 'actor_id' => $actor->id, 'reason' => $input['reason'], 'effective_at' => now(), 'before_snapshot' => ['version_id' => $current->id], 'after_snapshot' => $normalized]);
        foreach ($affected as $appointment) {
            $appointment->update(['requires_reschedule' => true]);
            OperationalChangeImpact::create(['operational_change_id' => $change->id, 'appointment_id' => $appointment->id, 'resolution' => 'PENDING']);
            $existing = RescheduleRequest::where('appointment_id', $appointment->id)->whereNotNull('active_guard')->first();
            if ($existing) {
                $existing->update(['origin' => 'CLINIC', 'quota_effect' => 0, 'requires_resolution' => true]);
            } else {
                app(Operations::class)->request($actor, $appointment, 'Perubahan operasional: '.$input['reason'], null, 'CLINIC');
            }
            Transactions::outbox('CALENDAR_CHANGED', 'appointments', $appointment->id, ['patient_id' => $appointment->patient_id, 'reason' => $input['reason'], 'attempt_number' => $appointment->attempt_number], $version->version);
        }
        Transactions::audit($actor, 'calendar.published', 'calendar_versions', $version->id, ['affected_count' => $affected->count()], $input['reason']);

        return ['id' => $version->id, 'affected_count' => $affected->count()];
    }

    public function cms(User $actor, array $input): CmsContent
    {
        Access::requireStaff($actor);
        $section = $input['section_key'];
        Access::check(in_array($section, ['landing', 'patient', 'psychologist', 'consent', 'privacy', 'clinical_identity'], true), 'Bagian CMS tidak sah.');
        $textKeys = $section === 'landing' ? ['heroTitle', 'heroSubtitle', 'heroBadge', 'heroImageUrl', 'aboutImageUrl', 'logoUrl', 'ctaTitle', 'ctaSubtitle', 'footerText', 'sliderTitle', 'sliderSubtitle', 'clinicName', 'clinicAddress', 'clinicPhone', 'clinicWhatsapp', 'clinicEmail', 'instagramUrl'] : ['title', 'body'];
        Access::check(! array_diff(array_keys($input['payload']), [...$textKeys, ...($section === 'landing' ? ['sliderIntervalSeconds', 'sliderAutoPlay', 'faqs'] : [])]), 'Isian konten tidak didukung.');
        foreach ($input['payload'] as $key => $value) {
            if (in_array($key, $textKeys, true)) {
                Access::check(is_string($value) && mb_strlen($value) <= 10000 && strip_tags($value) === $value, 'Konten harus berupa teks biasa.');
                if ($section === 'landing') {
                    Access::check(! preg_match('/(?:Rp\.?|IDR)\s*\d/iu', $value), 'Harga publik harus memakai field harga katalog, bukan teks CMS.');
                }
            } elseif ($key === 'faqs') {
                Access::check(is_array($value) && array_is_list($value) && count($value) <= 20, 'FAQ maksimal20pertanyaan.');
                foreach ($value as $faq) {
                    Access::check(is_array($faq) && isset($faq['q'],$faq['a']) && ! array_diff(array_keys($faq), ['q', 'a']), 'Isian FAQ tidak sah.');
                    foreach (['q', 'a'] as $field) {
                        Access::check(is_string($faq[$field]) && mb_strlen($faq[$field]) <= 5000 && strip_tags($faq[$field]) === $faq[$field] && ! preg_match('/(?:Rp\.?|IDR)\s*\d/iu', $faq[$field]), 'FAQ harus teks biasa tanpa nominal harga publik.');
                    }
                }
            } elseif ($key === 'sliderIntervalSeconds') {
                Access::check(is_int($value) && $value >= 2 && $value <= 60, 'Jeda carousel harus2–60detik.');
            } elseif ($key === 'sliderAutoPlay') {
                Access::check(is_bool($value), 'Pengaturan carousel tidak sah.');
            }
        }
        foreach (['heroImageUrl', 'aboutImageUrl', 'logoUrl'] as $image) {
            if (! empty($input['payload'][$image])) {
                Access::check((bool) preg_match('~^/media/[a-f0-9-]{36}\.(jpg|png|webp)$~D', $input['payload'][$image]), 'Gunakan gambar yang diunggah melalui CMS.');
            }
        }
        if (! empty($input['payload']['instagramUrl'])) {
            Access::check((bool) preg_match('~^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$~D', $input['payload']['instagramUrl']), 'URL Instagram tidak sah.');
        }
        if (($input['publish'] ?? false) && in_array($section, ['consent', 'privacy', 'clinical_identity'], true)) {
            Access::requireOwner($actor);
        }
        $published = ($input['publish'] ?? false);
        $current = CmsContent::where('section_key', $section)->where('status', 'PUBLISHED')->first();
        if (array_key_exists('expected_published_id', $input)) {
            Access::check(($current?->id) === ($input['expected_published_id'] ?: null), 'Konten terbit telah berubah. Muat ulang sebelum menerbitkan.');
        }
        if ($published) {
            foreach (CmsContent::where('section_key', $section)->where('status', 'PUBLISHED')->lockForUpdate()->get() as $old) {
                $old->update(['status' => 'ARCHIVED']);
            }
        }
        $content = CmsContent::create(['section_key' => $section, 'version' => (int) CmsContent::where('section_key', $section)->max('version') + 1, 'payload' => $input['payload'], 'status' => $published ? 'PUBLISHED' : 'DRAFT', 'published_at' => $published ? now() : null, 'updated_by' => $actor->id]);
        if ($published && $section === 'landing') {
            $settings = OwnerSetting::query()->lockForUpdate()->firstOrFail();
            $identity = $settings->practice_identity ?? [];
            foreach (['clinicName' => 'clinic_name', 'clinicAddress' => 'address', 'clinicPhone' => 'phone', 'clinicWhatsapp' => 'whatsapp', 'clinicEmail' => 'email'] as $key => $column) {
                if (array_key_exists($key, $input['payload'])) {
                    $identity[$column] = $input['payload'][$key];
                }
            }$settings->update(['practice_identity' => $identity]);
        }
        Transactions::audit($actor, 'cms.version', 'cms_contents', $content->id);

        return $content;
    }

    public function review(User $actor, BillingAccount $bill, array $input): Review
    {
        Access::check($actor->role === UserRole::Patient, 'Review hanya oleh pasien.');
        Access::patient($actor, $bill->patient_id);
        $appointments = Appointment::where('patient_id', $bill->patient_id)->where('status', 'COMPLETED');
        if ($bill->assessment_case_id) {
            $appointments->where('assessment_case_id', $bill->assessment_case_id);
            Access::check(AssessmentCase::findOrFail($bill->assessment_case_id)->status->value === 'CLOSED', 'Tunggu asesmen ditutup.');
        } else {
            $appointments->whereKey($bill->appointment_id);
        }
        Access::check($appointments->exists(), 'Review memerlukan layanan yang benar-benar selesai.');
        $review = Review::where('billing_account_id', $bill->id)->lockForUpdate()->first();
        $attributes = ['rating' => $input['rating'], 'comment' => $input['comment'] ?? null, 'is_anonymous' => $input['is_anonymous'] ?? true, 'status' => 'PENDING_MODERATION', 'moderated_at' => null, 'moderated_by' => null, 'moderation_reason' => null];
        if ($review) {
            Access::check($review->author_user_id === $actor->id, 'Review sudah dimiliki akun lain.');
            $review->update([...$attributes, 'version' => $review->version + 1]);

            return $review;
        }

        return Review::create([...$attributes, 'billing_account_id' => $bill->id, 'author_user_id' => $actor->id, 'version' => 1]);
    }
}
