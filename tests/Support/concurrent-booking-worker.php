<?php

use App\Domain\Bookings;
use App\Domain\Calendar;
use App\Domain\Transactions;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
[$script,$database,$actorId,$patientId] = $argv;
if (! preg_match('/^jiwasehat_schema_test_[a-f0-9]{12}$/D', $database)) {
    throw new RuntimeException('Worker hanya untuk database uji acak.');
}
config(['database.default' => 'mysql', 'database.connections.mysql.database' => $database, 'database.connections.mysql.url' => null, 'queue.default' => 'sync']);
DB::purge('mysql');
Date::setTestNow('2026-10-26T05:00:00+07:00');
CarbonImmutable::setTestNow('2026-10-26T05:00:00+07:00');
try {
    $actor = User::findOrFail($actorId);
    $input = ['appointment_kind' => 'CUSTOM', 'patient_id' => $patientId, 'start_at' => '2026-10-26T11:00:00+07:00', 'duration_minutes' => 60, 'custom_label' => 'Uji benturan slot', 'payment_requirement' => 'NOT_REQUIRED', 'owner_authorization_note' => 'Persetujuan owner dalam pengujian terisolasi', 'profiling_mode' => 'NONE'];
    $result = app(Transactions::class)->run($actor, 'test.concurrent', (string) Str::uuid(), $input, function () use ($actor, $input) {
        $calendar = app(Calendar::class);
        $calendar->lock($calendar->settings()->owner_user_id, ['2026-10-26']);
        usleep(250000);

        return ['id' => app(Bookings::class)->create($actor, $input)->id];
    });
    echo json_encode(['result' => 'CREATED', 'id' => $result['id']]);
} catch (ValidationException) {
    echo json_encode(['result' => 'CONFLICT']);
} catch (Throwable $error) {
    fwrite(STDERR, get_class($error).': '.$error->getMessage());
    exit(1);
}
