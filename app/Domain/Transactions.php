<?php

namespace App\Domain;

use App\Models\AuditLog;
use App\Models\IdempotencyRequest;
use App\Models\NotificationOutbox;
use App\Models\OwnerSetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class Transactions
{
    public function run(User $actor, string $scope, string $key, array $payload, callable $operation): array
    {
        Access::check(strlen($key) >= 16 && strlen($key) <= 150, 'Idempotency-Key wajib untuk aksi ini.');
        $normalize = function (array $input) use (&$normalize): array {
            if (! array_is_list($input)) {
                ksort($input);
            }
            foreach ($input as &$value) {
                if (is_array($value)) {
                    $value = $normalize($value);
                }
            }

            return $input;
        };
        $hash = hash('sha256', json_encode($normalize($payload), JSON_THROW_ON_ERROR));

        return DB::transaction(function () use ($actor, $scope, $key, $hash, $operation): array {
            // Acquire the practice mutex before ANY ordinary read establishes an InnoDB
            // REPEATABLE READ snapshot. Waiting for a later lock cannot refresh that snapshot.
            OwnerSetting::query()->lockForUpdate()->first();
            $currentActor = User::whereKey($actor->id)->lockForUpdate()->firstOrFail();
            Access::check($currentActor->status->value === 'ACTIVE' && $currentActor->role === $actor->role && $currentActor->auth_version === $actor->auth_version, 'Akses akun berubah saat menunggu. Silakan masuk kembali.');
            DB::table('idempotency_requests')->insertOrIgnore(['id' => (string) Str::uuid(), 'actor_id' => $actor->id, 'scope' => $scope,
                'request_key' => $key, 'payload_hash' => $hash, 'status' => 'PROCESSING', 'expires_at' => now()->addDays(30), 'created_at' => now(), 'updated_at' => now(), 'row_version' => 1]);
            $request = IdempotencyRequest::where('actor_id', $actor->id)->where('scope', $scope)->where('request_key', $key)->lockForUpdate()->firstOrFail();
            Access::check(hash_equals($request->payload_hash, $hash), 'Kunci permintaan sudah dipakai untuk isi berbeda.');
            if ($request->status->value === 'COMPLETED') {
                return $request->response_snapshot;
            }
            $result = $operation();
            $request->update(['status' => 'COMPLETED', 'response_status' => 200, 'response_snapshot' => $result]);

            return $result;
        }, 5);
    }

    public static function audit(?User $actor, string $action, string $table, string $id, array $safe = [], ?string $reason = null): void
    {
        AuditLog::create(['actor_id' => $actor?->id, 'action' => $action, 'resource_type' => $table, 'resource_id' => $id,
            'new_value' => $safe, 'reason' => $reason, 'request_id' => (string) Str::uuid()]);
    }

    public static function outbox(string $event, string $table, string $id, array $safe, ?int $version = null, mixed $at = null): void
    {
        $key = $event.':'.$id.':'.($version ?? 1).':'.($safe['attempt_number'] ?? 0).':'.substr(hash('sha256', $safe['delivery_request'] ?? $safe['payment_id'] ?? ''), 0, 12);
        NotificationOutbox::firstOrCreate(['event_key' => $key], ['event_type' => $event, 'resource_type' => $table,
            'resource_id' => $id, 'resource_version' => $version, 'payload' => $safe, 'available_at' => $at]);
    }

    public static function bump(Model $model): void
    {
        $model->setAttribute('row_version', $model->row_version + 1)->save();
    }
}
