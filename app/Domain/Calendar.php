<?php

namespace App\Domain;

use App\Models\Appointment;
use App\Models\CalendarVersion;
use App\Models\OwnerSetting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class Calendar
{
    public const OCCUPYING = ['WAITING_PAYMENT', 'WAITING_VERIFICATION', 'CONFIRMED', 'CONFIRMED_AUTO_SLA', 'CHECKED_IN', 'IN_CONSULTATION'];

    public function settings(): OwnerSetting
    {
        $settings = OwnerSetting::first();
        abort_unless($settings, 503, 'Praktik belum dikonfigurasi. Jalankan practice:install.');

        return $settings;
    }

    public function instant(string $value): CarbonImmutable
    {
        return CarbonImmutable::parse($value, 'Asia/Jakarta')->utc();
    }

    public function version(?CarbonImmutable $at = null): CalendarVersion
    {
        return CalendarVersion::where('effective_at', '<=', $at ?? CarbonImmutable::now())->orderByDesc('version')->firstOrFail();
    }

    public function intervals(string $date, ?string $versionId = null): array
    {
        Access::check((bool) preg_match('/^\d{4}-\d{2}-\d{2}$/D', $date), 'Tanggal tidak valid.', 'date');
        $day = CarbonImmutable::parse($date, 'Asia/Jakarta');
        Access::check($day->toDateString() === $date, 'Tanggal tidak valid.', 'date');
        $versionId ??= $this->version()->id;
        $override = DB::table('schedule_overrides')->where('calendar_version_id', $versionId)->where('local_date', $date)->first();
        if ($override) {
            $rows = $override->mode === 'OPEN' ? DB::table('schedule_override_intervals')->where('override_id', $override->id)->orderBy('start_time')->get() : collect();
            $limit = $override->daily_limit;
        } else {
            $rows = DB::table('weekly_schedules')->where('calendar_version_id', $versionId)->where('day_of_week', $day->dayOfWeekIso)->orderBy('start_time')->get();
            $limit = DB::table('weekly_schedule_limits')->where('calendar_version_id', $versionId)->where('day_of_week', $day->dayOfWeekIso)->value('daily_limit') ?? 0;
        }

        return ['intervals' => $rows->map(fn ($row) => [$this->instant($date.' '.$row->start_time), $this->instant($date.' '.$row->end_time)])->all(), 'limit' => (int) $limit, 'version' => $versionId];
    }

    public function addWorkingMinutes(CarbonImmutable $anchor, int $minutes, ?string $versionId = null): CarbonImmutable
    {
        Access::check($minutes >= 0 && $minutes <= 525600, 'Durasi operasional di luar batas.');
        $versionId ??= $this->version($anchor)->id;
        $remaining = $minutes * 60;
        $date = $anchor->setTimezone('Asia/Jakarta')->startOfDay();
        for ($day = 0; $day < 731; $day++, $date = $date->addDay()) {
            foreach ($this->intervals($date->toDateString(), $versionId)['intervals'] as [$start, $end]) {
                $cursor = $anchor->greaterThan($start) ? $anchor : $start;
                if ($cursor->greaterThanOrEqualTo($end)) {
                    continue;
                }
                $seconds = (int) $cursor->diffInSeconds($end);
                if ($remaining <= $seconds) {
                    return $cursor->addSeconds($remaining);
                }
                $remaining -= $seconds;
            }
        }
        Access::check(false, 'Tidak ada jam operasional yang cukup dalam dua tahun.');
    }

    public function lock(string $owner, array $dates): void
    {
        // Satu praktisi: mutex praktik juga menutup race publish kalender vs tanggal yang belum berisi booking.
        OwnerSetting::query()->lockForUpdate()->firstOrFail();
        sort($dates);
        foreach (array_unique($dates) as $date) {
            DB::table('schedule_resources')->insertOrIgnore(['id' => (string) Str::uuid(), 'psychologist_id' => $owner, 'local_date' => $date, 'created_at' => now(), 'updated_at' => now(), 'row_version' => 1]);
            DB::table('schedule_resources')->where('psychologist_id', $owner)->where('local_date', $date)->lockForUpdate()->first();
        }
    }

    public function assertFree(CarbonImmutable $start, CarbonImmutable $end, string $owner, ?string $exclude = null): void
    {
        Access::check($start->greaterThanOrEqualTo(CarbonImmutable::now()->subSeconds(5)) && $end->greaterThan($start), 'Jadwal harus dimulai sekarang atau di masa depan.', 'start_at');
        Access::check($end->setTimezone('Asia/Jakarta')->toDateString() === $start->setTimezone('Asia/Jakarta')->toDateString(), 'Sesi tidak boleh melewati pergantian hari.');
        $schedule = $this->intervals($start->setTimezone('Asia/Jakarta')->toDateString());
        Access::check(collect($schedule['intervals'])->contains(fn ($range) => $start->greaterThanOrEqualTo($range[0]) && $end->lessThanOrEqualTo($range[1])), 'Durasi tidak muat pada jam buka.', 'start_at');
        $query = Appointment::where('psychologist_id', $owner)->whereIn('status', self::OCCUPYING)->when($exclude, fn ($q) => $q->where('id', '<>', $exclude));
        Access::check(! (clone $query)->where('start_at', '<', $end)->where('end_at', '>', $start)->exists(), 'Slot sudah digunakan. Pilih jadwal lain.', 'start_at');
        Access::check(! (clone $query)->where('status', 'IN_CONSULTATION')->whereNull('actual_ended_at')->where('start_at', '<=', now())->exists() || $start->greaterThan(CarbonImmutable::now()->addMinutes(5)), 'Praktisi masih melayani; selesaikan layanan sebelumnya dahulu.');
        $local = $start->setTimezone('Asia/Jakarta')->startOfDay();
        $count = (clone $query)->where('start_at', '>=', $local->utc())->where('start_at', '<', $local->addDay()->utc())->count();
        Access::check($count < $schedule['limit'], 'Kuota harian penuh.', 'start_at');
    }

    public function slots(string $date, int $duration, bool $online, ?string $exclude = null): array
    {
        Access::check($duration > 0 && $duration <= 480, 'Durasi harus 1–480 menit.');
        $settings = $this->settings();
        $earliest = $online ? $this->addWorkingMinutes(CarbonImmutable::now(), $settings->online_lead_working_minutes) : CarbonImmutable::now();
        $result = [];
        foreach ($this->intervals($date)['intervals'] as [$start, $end]) {
            for ($cursor = $start; $cursor->addMinutes($duration)->lessThanOrEqualTo($end); $cursor = $cursor->addMinutes(15)) {
                if ($cursor->lessThan($earliest)) {
                    continue;
                }
                try {
                    $this->assertFree($cursor, $cursor->addMinutes($duration), $settings->owner_user_id, $exclude);
                } catch (ValidationException) {
                    continue;
                }
                $result[] = ['start_at' => $cursor->toIso8601String(), 'end_at' => $cursor->addMinutes($duration)->toIso8601String(), 'label' => $cursor->setTimezone('Asia/Jakarta')->format('H:i')];
            }
        }

        return $result;
    }
}
