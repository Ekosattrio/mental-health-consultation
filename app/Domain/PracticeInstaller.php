<?php

namespace App\Domain;

use App\Models\CalendarVersion;
use App\Models\CmsContent;
use App\Models\ConsultationPackage;
use App\Models\OwnerSetting;
use App\Models\PackageVersion;
use App\Models\PretestTemplate;
use App\Models\TutorialContent;
use App\Models\User;
use App\Models\WeeklySchedule;
use App\Models\WeeklyScheduleLimit;
use Illuminate\Support\Facades\DB;

final class PracticeInstaller
{
    public function install(string $name, string $email, string $password): User
    {
        return DB::transaction(function () use ($name, $email, $password) {
            Access::check(! OwnerSetting::exists() && ! User::where('role', 'PSYCHOLOGIST')->exists(), 'Owner sudah tersedia. Instalasi tidak menimpa akun/konfigurasi lama.');
            $owner = new User;
            $owner->forceFill(['name' => $name, 'email' => $email, 'password_hash' => $password, 'role' => 'PSYCHOLOGIST'])->save();
            $owner->refresh();
            OwnerSetting::create(['owner_user_id' => $owner->id, 'practice_identity' => ['clinic_name' => 'JiwaSehat', 'name' => $name], 'initial_payment_mode' => 'PERCENT', 'initial_payment_basis_points' => 5000]);
            $calendar = CalendarVersion::create(['version' => 1, 'effective_at' => now(), 'created_by' => $owner->id, 'reason' => 'Konfigurasi awal; dapat diubah melalui Kalender']);
            foreach (range(1, 7) as $day) {
                WeeklyScheduleLimit::create(['calendar_version_id' => $calendar->id, 'day_of_week' => $day, 'daily_limit' => 8]);
                if ($day !== 7) {
                    WeeklySchedule::create(['calendar_version_id' => $calendar->id, 'day_of_week' => $day, 'start_time' => '08:00', 'end_time' => '16:00']);
                }
            }
            $prices = [900000, 750000, 900000, 900000, 1500000, 350000, 1500000, 750000, 500000, 900000, 500000, 900000, 500000, 900000, 500000];
            foreach (config('jiwasehat.public_packages') as $index => [$code,$label,$category,$duration]) {
                $package = ConsultationPackage::create(['service_code' => $code, 'category' => $category, 'created_by' => $owner->id]);
                if ($category === 'PSYCHOTHERAPY') {
                    $duration = 60;
                }
                PackageVersion::create(['package_id' => $package->id, 'version' => 1, 'name' => $label, 'description' => $code === 'ASSESSMENT_FULL' ? 'Layanan tes dan asesmen lengkap, deskripsi 2–4 jam; jadwal dasar4jam.' : ($category === 'ASSESSMENT' ? 'Layanan tes; hasil laporan termasuk. Durasi ditentukan praktisi.' : 'Layanan sesuai kebutuhan pada jadwal yang disepakati.'),
                    'normal_price' => $prices[$index], 'duration_minutes' => $duration, 'delivery_mode' => $code === 'COUNSELING_TELE_SERVICE' ? 'TELE_SERVICE' : 'OFFLINE', 'additional_time_price_basis' => $category === 'COUNSELING' ? 'NORMAL_PRICE' : null,
                    'billing_mode' => match ($category) {
                        'ASSESSMENT' => 'PER_PACKAGE','PSYCHOTHERAPY' => 'PER_SESSION',default => 'PER_APPOINTMENT'
                    }, 'minimum_sessions' => $category === 'PSYCHOTHERAPY' ? 4 : 1, 'includes_result_report' => $category === 'ASSESSMENT', 'requires_evaluation' => $code === 'ASSESSMENT_BASIC',
                    'benefits' => $category === 'ASSESSMENT' ? ['Laporan asesmen termasuk', 'Jadwal lanjutan sesuai kebutuhan praktisi'] : ($category === 'PSYCHOTHERAPY' ? ['Tarif per sesi', 'Rencana awal empat sesi'] : ['Sesi konseling terjadwal']),
                    'is_bookable' => $duration !== null, 'effective_at' => now(), 'created_by' => $owner->id]);
            }
            foreach (['consent' => 'Saya telah membaca informasi layanan, biaya dan jadwal yang dipilih, memahami bahwa bukti transfer akan diperiksa Admin, dan menyetujui pencatatan administrasi untuk pelayanan ini.', 'privacy' => 'Data administrasi digunakan untuk pelayanan dan penjadwalan; informasi klinis ditangani praktisi. Hubungi praktik untuk pertanyaan atau koreksi data.'] as $key => $text) {
                CmsContent::create(['section_key' => $key, 'version' => 1, 'payload' => ['title' => $key === 'consent' ? 'Persetujuan layanan' : 'Informasi privasi', 'body' => $text], 'status' => 'PUBLISHED', 'published_at' => now(), 'updated_by' => $owner->id]);
            }
            PretestTemplate::create(['template_key' => 'profiling', 'version' => 1, 'effective_at' => now(), 'created_by' => $owner->id, 'questions' => [
                ['key' => 'complaint', 'label' => 'Keluhan atau alasan konsultasi', 'type' => 'text', 'required' => true], ['key' => 'goals', 'label' => 'Harapan dari pertemuan', 'type' => 'text', 'required' => false],
                ['key' => 'previous_therapy', 'label' => 'Pernah mengikuti terapi?', 'type' => 'boolean', 'required' => false], ['key' => 'medication', 'label' => 'Obat yang sedang digunakan (bila ada)', 'type' => 'text', 'required' => false]]]);
            foreach (['PATIENT', 'ADMIN', 'PSYCHOLOGIST'] as $role) {
                TutorialContent::create(['content_key' => 'workspace-'.$role, 'role' => $role, 'version' => 1, 'title' => 'Panduan '.($role === 'PATIENT' ? 'Pasien' : ($role === 'ADMIN' ? 'Admin' : 'Owner')),
                    'steps' => $role === 'PATIENT' ? ['Lengkapi profil orang yang dilayani.', 'Pilih paket, jadwal dan isi profiling baru.', 'Baca deadline, transfer lalu unggah bukti.', 'Pantau jadwal, tagihan dan pengajuan reschedule.'] : ['Kalender adalah sumber jam buka dan slot.', 'Catat fakta layanan dan pembayaran sesuai kewenangan.', 'Gunakan alasan untuk perubahan dan perhatikan konflik versi.', 'Notifikasi gagal dapat ditinjau tanpa mengulang transaksi.'], 'is_active' => true]);
            }
            Transactions::audit($owner, 'practice.installed', 'users', $owner->id);

            return $owner;
        }, 5);
    }
}
