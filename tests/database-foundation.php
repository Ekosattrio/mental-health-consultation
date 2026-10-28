<?php

use App\Enums\PaymentStatus;
use App\Exceptions\StaleDomainRecord;
use App\Models\Appointment;
use App\Models\BillingAccount;
use App\Models\CalendarVersion;
use App\Models\ConsultationPackage;
use App\Models\OwnerSetting;
use App\Models\PackageVersion;
use App\Models\PatientProfile;
use App\Models\PaymentAllocation;
use App\Models\PaymentTransaction;
use App\Models\PretestSubmission;
use App\Models\PretestTemplate;
use App\Models\Receipt;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// Integrasi MySQL nyata pada database acak terisolasi; tidak memakai DB aplikasi.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$config = config('database.connections.mysql');
if (! in_array($config['host'], ['127.0.0.1', 'localhost'], true)) {
    throw new RuntimeException('Uji ini hanya untuk MySQL lokal.');
}
$testDatabase = 'jiwasehat_schema_test_'.bin2hex(random_bytes(6));
if (! preg_match('/^jiwasehat_schema_test_[a-f0-9]{12}$/D', $testDatabase)) {
    throw new RuntimeException('Nama database uji tidak aman.');
}
$pdo = new PDO('mysql:host='.$config['host'].';port='.$config['port'].';charset=utf8mb4', $config['username'], $config['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$pdo->exec("CREATE DATABASE `{$testDatabase}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
config(['database.default' => 'mysql', 'database.connections.mysql.database' => $testDatabase, 'database.connections.mysql.url' => null]);
DB::purge('mysql');
$checks = 0;
$assert = function (bool $condition, string $message) use (&$checks): void {
    if (! $condition) {
        throw new RuntimeException($message);
    }
    $checks++;
};
$rejects = function (callable $operation, string $message, ?string $expected = null) use ($assert): void {
    try {
        $operation();
    } catch (Throwable $error) {
        $assert($expected === null || $error instanceof $expected, $message.' (jenis exception tidak cocok: '.get_class($error).')');

        return;
    }
    throw new RuntimeException($message.' (operasi justru diterima)');
};
$make = function (string $class, array $attributes) {
    $model = new $class;
    $model->forceFill($attributes)->save();

    return $model->refresh();
};
$now = now()->startOfSecond();

try {
    if (Artisan::call('migrate', ['--force' => true]) !== 0) {
        throw new RuntimeException(Artisan::output());
    }
    $assert(count(DB::select('SHOW TABLES')) === 57, 'Jumlah tabel schema lengkap');
    $owner = $make(User::class, ['name' => 'Owner Uji', 'email' => 'OWNER@example.test', 'role' => 'PSYCHOLOGIST', 'status' => 'ACTIVE']);
    $admin = $make(User::class, ['name' => 'Admin Uji', 'email' => 'admin@example.test', 'role' => 'ADMIN', 'status' => 'ACTIVE']);
    $assert($owner->email === 'owner@example.test', 'Email dinormalisasi');
    $settings = $make(OwnerSetting::class, ['owner_user_id' => $owner->id, 'practice_identity' => []]);
    $assert($settings->initial_payment_mode->value === 'PERCENT' && $settings->initial_payment_basis_points === 5000, 'Default minimum 50 persen mengikuti ide pemilik, bukan perubahan sepihak preview');
    $unrefreshed = User::create(['name' => 'Akun baru', 'email' => 'new@example.test']);
    $unrefreshed->update(['name' => 'Akun berubah']);
    $assert($unrefreshed->row_version === 2, 'Akun baru dapat disimpan lagi tanpa wajib refresh default DB');
    $rejects(fn () => $make(User::class, ['name' => 'Owner Dua', 'email' => 'owner2@example.test', 'role' => 'PSYCHOLOGIST']), 'Hanya satu owner aktif');
    $make(User::class, ['name' => 'Offline 1']);
    $make(User::class, ['name' => 'Offline 2']);
    $profile = $make(PatientProfile::class, ['full_name' => 'Pasien Uji']);
    $assert((bool) preg_match('/^[a-f0-9-]{14}4[a-f0-9-]{21}$/', $profile->id), 'Identitas UUIDv4');
    $copy1 = PatientProfile::findOrFail($profile->id);
    $copy2 = PatientProfile::findOrFail($profile->id);
    $copy1->update(['city' => 'Bandung']);
    $rejects(fn () => $copy2->update(['city' => 'Jakarta']), 'Tidak menimpa perubahan petugas lain', StaleDomainRecord::class);
    $assert($copy1->row_version === 2, 'Versi bertambah');
    $rejects(fn () => $profile->delete(), 'Profil tidak dihapus permanen');

    $package = $make(ConsultationPackage::class, ['service_code' => 'COUNSELING_TEST', 'category' => 'COUNSELING', 'created_by' => $owner->id]);
    $versionAttributes = ['package_id' => $package->id, 'version' => 1, 'name' => 'Paket Uji', 'description' => 'Paket uji', 'normal_price' => 900000,
        'duration_minutes' => 60, 'additional_time_price_basis' => 'NORMAL_PRICE', 'billing_mode' => 'PER_APPOINTMENT', 'benefits' => [], 'effective_at' => $now, 'created_by' => $owner->id];
    $version = $make(PackageVersion::class, $versionAttributes);
    $rejects(fn () => $make(PackageVersion::class, [...$versionAttributes, 'version' => 2, 'promo_price' => 900000]), 'Promo tidak boleh nol-neto/tidak lebih rendah');
    $rejects(fn () => DB::table('package_versions')->where('id', $version->id)->update(['normal_price' => 1]), 'Harga versi lama terlindungi terhadap raw UPDATE');
    $calendar = $make(CalendarVersion::class, ['version' => 1, 'effective_at' => $now, 'created_by' => $admin->id, 'reason' => 'Jam operasional awal']);
    $appointmentAttributes = ['booking_code' => 'BOOK-TEST-1', 'patient_id' => $profile->id, 'booked_by_user_id' => $admin->id, 'psychologist_id' => $owner->id,
        'package_version_id' => $version->id, 'profiling_mode' => 'PAPER', 'booking_source' => 'ADMIN_WALK_IN', 'identity_snapshot' => ['full_name' => 'Pasien Uji'],
        'calendar_version_id' => $calendar->id, 'start_at' => $now->copy()->addHours(4), 'end_at' => $now->copy()->addHours(5)];
    $appointment = $make(Appointment::class, $appointmentAttributes);
    $assert($appointment->packageVersion->id === $version->id, 'Relasi appointment-paket');
    $rejects(fn () => $make(Appointment::class, [...$appointmentAttributes, 'booking_code' => 'BOOK-INVALID', 'end_at' => $now]), 'Interval jadwal wajib valid');
    $rejects(fn () => $make(Appointment::class, [...$appointmentAttributes, 'booking_code' => 'BOOK-INVALID-PATIENT', 'patient_id' => (string) Str::uuid()]), 'FK mencegah pasien tanpa induk');
    $custom = [...$appointmentAttributes, 'booking_code' => 'CUSTOM-FREE', 'package_version_id' => null, 'appointment_kind' => 'CUSTOM', 'payment_requirement' => 'NOT_REQUIRED', 'profiling_mode' => 'NONE', 'custom_label' => 'Arahan owner', 'owner_authorization_note' => 'Disepakati di luar sistem'];
    $free = $make(Appointment::class, $custom);
    $assert($free->payment_requirement->value === 'NOT_REQUIRED', 'Tanpa biaya mempunyai status sendiri');
    $rejects(fn () => $make(Appointment::class, [...$custom, 'booking_code' => 'CUSTOM-INVALID', 'payment_requirement' => 'REQUIRED']), 'Custom berbayar tidak boleh tanpa nominal');
    $billing = $make(BillingAccount::class, ['patient_id' => $profile->id, 'appointment_id' => $appointment->id, 'initial_minimum_due' => 100000, 'initial_payment_policy_snapshot' => ['mode' => 'FIXED', 'fixed_amount' => 100000]]);
    $paymentAttributes = ['billing_account_id' => $billing->id, 'appointment_id' => $appointment->id, 'purpose' => 'DP', 'method' => 'TRANSFER', 'status' => 'PENDING_VERIFICATION', 'claimed_amount' => 150000, 'submitted_by' => $admin->id];
    $payment = $make(PaymentTransaction::class, $paymentAttributes);
    $assert($payment->amount === null && $payment->status === PaymentStatus::PendingVerification, 'Bukti belum membuat uang aktual');
    $rejects(fn () => $make(PaymentTransaction::class, [...$paymentAttributes, 'status' => 'VERIFIED']), 'Verified perlu uang dan pemeriksa nyata');
    $payment->update(['amount' => 150000, 'received_at' => $now, 'verified_at' => $now, 'verified_by' => $admin->id, 'status' => 'VERIFIED']);
    $assert($payment->amount === 150000, 'Nominal aktual tidak dipaksa tepat DP atau full');
    $rejects(fn () => DB::table('payment_transactions')->where('id', $payment->id)->update(['amount' => 1]), 'Kas verified immutable terhadap raw UPDATE');
    $rejects(fn () => DB::table('payment_transactions')->where('id', $payment->id)->delete(), 'Kas tidak dapat dihapus');
    $assert(! array_key_exists('amount', $payment->toArray()), 'Nominal kas tidak bocor dari serialisasi default');
    $allocationAttributes = ['payment_transaction_id' => $payment->id, 'billing_account_id' => $billing->id, 'amount' => 150000, 'allocation_key' => 'alloc-test', 'created_by' => $admin->id];
    $allocation = $make(PaymentAllocation::class, $allocationAttributes);
    $assert($allocation->paymentTransaction->id === $payment->id, 'Alokasi merujuk kas, tidak membuat penerimaan kedua');
    $rejects(fn () => $make(PaymentAllocation::class, $allocationAttributes), 'Retry alokasi tidak menggandakan record');
    $rejects(fn () => $make(PaymentAllocation::class, [...$allocationAttributes, 'allocation_key' => 'too-much', 'amount' => 150001]), 'Alokasi tunggal tidak boleh lebih besar dari kas');
    $receiptAttributes = ['payment_transaction_id' => $payment->id, 'receipt_number' => 'RCPT-TEST', 'issued_at' => $now, 'snapshot' => ['received' => 150000]];
    $receipt = $make(Receipt::class, $receiptAttributes);
    $rejects(fn () => DB::table('receipts')->where('id', $receipt->id)->update(['receipt_number' => 'overwrite']), 'Receipt terbit immutable');
    $pendingPayment = $make(PaymentTransaction::class, $paymentAttributes);
    $rejects(fn () => $make(Receipt::class, [...$receiptAttributes, 'payment_transaction_id' => $pendingPayment->id, 'receipt_number' => 'RCPT-INVALID']), 'Klaim uang belum boleh menerbitkan receipt');
    $otherProfile = $make(PatientProfile::class, ['full_name' => 'Pasien Lain']);
    $rejects(fn () => $make(BillingAccount::class, ['patient_id' => $otherProfile->id, 'appointment_id' => $appointment->id, 'initial_minimum_due' => 100000, 'initial_payment_policy_snapshot' => []]), 'Billing tidak boleh menaut appointment pasien lain');
    $therapyPackage = $make(ConsultationPackage::class, ['service_code' => 'THERAPY', 'category' => 'PSYCHOTHERAPY', 'created_by' => $owner->id]);
    $planAttributes = ['patient_id' => $profile->id, 'package_id' => $therapyPackage->id, 'psychologist_id' => $owner->id, 'status' => 'AWAITING_SETTLEMENT'];
    $make(TreatmentPlan::class, $planAttributes);
    $rejects(fn () => $make(TreatmentPlan::class, [...$planAttributes, 'status' => 'ACTIVE']), 'Plan menunggu pelunasan memblokir plan aktif kedua');
    $template = $make(PretestTemplate::class, ['template_key' => 'profiling', 'version' => 1, 'questions' => [], 'effective_at' => $now, 'created_by' => $owner->id]);
    $pretest = $make(PretestSubmission::class, ['patient_id' => $profile->id, 'template_id' => $template->id, 'author_user_id' => $owner->id, 'answers' => ['complaint' => 'KONTEKS_RAHASIA_UJI'], 'status' => 'SUBMITTED', 'submitted_at' => $now]);
    $stored = DB::table('pretest_submissions')->where('id', $pretest->id)->value('answers');
    $assert(! str_contains($stored, 'KONTEKS_RAHASIA_UJI') && $pretest->answers['complaint'] === 'KONTEKS_RAHASIA_UJI', 'Jawaban terenkripsi dan dapat dibaca kembali');
    $pretest->update(['appointment_id' => $appointment->id]);
    $rejects(fn () => DB::table('pretest_submissions')->where('id', $pretest->id)->update(['answers' => 'overwrite']), 'Submission lama tidak ditimpa');
    $assert(! array_key_exists('answers', $pretest->toArray()), 'Klinis tidak diserialisasi default');

    if (Artisan::call('migrate:rollback', ['--force' => true]) !== 0) {
        throw new RuntimeException(Artisan::output());
    }
    $assert(count(DB::select('SHOW TABLES')) === 1, 'Rollback seluruh schema berhasil, hanya repository migrations tersisa');
    if (Artisan::call('migrate', ['--force' => true]) !== 0) {
        throw new RuntimeException(Artisan::output());
    }
    $assert(count(DB::select('SHOW TABLES')) === 57, 'Migrasi ulang setelah rollback berhasil');
    echo json_encode(['result' => 'PASS', 'checks' => $checks, 'database' => 'isolated disposable MySQL', 'tables' => 57]), PHP_EOL;
} catch (Throwable $error) {
    $failure = $error;
} finally {
    DB::disconnect('mysql');
    // Target adalah nama acak yang diverifikasi di atas, tidak pernah DB_DATABASE aplikasi.
    $pdo->exec("DROP DATABASE `{$testDatabase}`");
}
if (isset($failure)) {
    fwrite(STDERR, get_class($failure).': '.$failure->getMessage().' at '.$failure->getFile().':'.$failure->getLine().PHP_EOL);
    exit(1);
}
