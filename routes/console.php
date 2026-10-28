<?php

use App\Domain\Access;
use App\Domain\Clockwork;
use App\Domain\PracticeInstaller;
use App\Models\OwnerSetting;
use App\Models\PatientAccess;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Validation\Rules\Password;

Artisan::command('practice:install {--name=} {--email=}', function (): void {
    $name = $this->option('name') ?: $this->ask('Nama owner');
    $email = $this->option('email') ?: $this->ask('Email owner');
    $password = $this->secret('Kata sandi owner (minimal12karakter, huruf besar/kecil dan angka)');
    validator(['name' => $name, 'email' => $email, 'password' => $password], ['name' => 'required|string|max:150', 'email' => 'required|email|max:254', 'password' => ['required', Password::min(12)->mixedCase()->numbers()]])->validate();
    app(PracticeInstaller::class)->install($name, $email, $password);
    $this->info('Praktik terpasang. Masuk dengan akun owner lalu buat akun Admin dan tinjau katalog/jam buka.');
})->purpose('Pasang owner dan konfigurasi awal tanpa data pasien/demo');

Artisan::command('practice:tick', function (): void {
    $this->line(json_encode(app(Clockwork::class)->tick()));
})->purpose('Proses expiry, SLA dan outbox jadwal');
Artisan::command('practice:purge-files', function (): void {
    $this->info('Berkas dibersihkan: '.app(Clockwork::class)->purgeFiles());
})->purpose('Jalankan retensi berkas privat');
Schedule::command('practice:tick')->everyMinute()->withoutOverlapping();
Schedule::command('practice:purge-files')->dailyAt('01:30')->timezone('Asia/Jakarta')->withoutOverlapping();

Artisan::command('practice:initial-accounts', function (): void {
    DB::transaction(function (): void {
        if (! OwnerSetting::exists()) {
            app(PracticeInstaller::class)->install('Superadmin', 'superadmin@jiwasehat.test', 'superadmin123');
        }
        foreach ([['admin', 'ADMIN', 'admin123'], ['pasien', 'PATIENT', 'pasien123']] as [$name,$role,$password]) {
            $existing = User::where('email', $name.'@jiwasehat.test')->first();
            if ($existing) {
                Access::check($existing->role->value === $role, 'Email akun awal sudah dipakai peran berbeda.');

                continue;
            }
            $user = new User;
            $user->forceFill(['name' => ucfirst($name), 'email' => $name.'@jiwasehat.test', 'password_hash' => $password, 'role' => $role])->save();
            if ($role === 'PATIENT') {
                $profile = PatientProfile::create(['full_name' => 'Pasien']);
                PatientAccess::create(['account_user_id' => $user->id, 'patient_id' => $profile->id, 'relationship' => 'SELF', 'verified_by' => $user->id, 'verified_at' => now()]);
            }
        }
    }, 5);
    $this->info('Akun awal siap. Detail masuk dicatat di docs/AKUN_AWAL_DAN_CARA_MASUK.md. Akun lama tidak direset oleh pengulangan perintah.');
})->purpose('Buat tiga akun awal yang ditentukan pengguna, tanpa menimpa akun lama');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
