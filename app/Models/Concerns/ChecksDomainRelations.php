<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

/** Pemeriksaan referensi saat save Eloquent; tidak menggantikan lock/action/policy. */
trait ChecksDomainRelations
{
    public static function bootChecksDomainRelations(): void
    {
        static::saving(function (Model $model): void {
            $attributes = $model->getAttributes();
            $connection = $model->getConnection();
            $find = fn (string $table, ?string $id) => $id ? $connection->table($table)->where('id', $id)->first() : null;
            $require = function (bool $condition, string $message): void {
                if (! $condition) {
                    throw new InvalidArgumentException($message);
                }
            };
            $patientMatches = function (?object $record) use ($require, $attributes): void {
                $require($record !== null && $record->patient_id === ($attributes['patient_id'] ?? null), 'Referensi harus milik profil pasien yang sama.');
            };

            switch ($model->getTable()) {
                case 'billing_accounts':
                    $patientMatches($find(isset($attributes['appointment_id']) ? 'appointments' : 'assessment_cases', $attributes['appointment_id'] ?? $attributes['assessment_case_id'] ?? null));
                    break;
                case 'appointments':
                    if (! $model->exists && ($attributes['payment_requirement'] ?? null) === 'NOT_REQUIRED' && in_array($attributes['status']??null,[null,'WAITING_PAYMENT'],true)) {
                        $model->setAttribute('status', 'CONFIRMED');
                    }
                    foreach (['treatment_plan_id' => 'treatment_plans', 'assessment_case_id' => 'assessment_cases'] as $column => $table) {
                        if (! empty($attributes[$column])) {
                            $patientMatches($find($table, $attributes[$column]));
                        }
                    }
                    break;
                case 'owner_settings':
                case 'schedule_resources':
                case 'treatment_plans':
                    $owner = $find('users', $attributes['owner_user_id'] ?? $attributes['psychologist_id'] ?? null);
                    $require($owner !== null && $owner->role === 'PSYCHOLOGIST' && $owner->status === 'ACTIVE', 'Praktisi harus owner aktif.');
                    if ($model->getTable() === 'treatment_plans') {
                        $package = $find('consultation_packages', $attributes['package_id'] ?? null);
                        $require($package !== null && $package->category === 'PSYCHOTHERAPY', 'Plan hanya untuk paket Psikoterapi.');
                    }
                    break;
                case 'assessment_cases':
                    $version = $find('package_versions', $attributes['package_version_id'] ?? null);
                    $package = $version ? $find('consultation_packages', $version->package_id) : null;
                    $require($package !== null && $package->category === 'ASSESSMENT', 'Case hanya untuk paket Asesmen.');
                    break;
                case 'pretest_submissions':
                case 'consents':
                    if (! empty($attributes['appointment_id'])) {
                        $patientMatches($find('appointments', $attributes['appointment_id']));
                    }
                    break;
                case 'appointment_billing_links':
                    $appointment = $find('appointments', $attributes['appointment_id'] ?? null);
                    $billing = $find('billing_accounts', $attributes['billing_account_id'] ?? null);
                    $require($appointment !== null && $billing !== null && $appointment->patient_id === $billing->patient_id
                        && $appointment->appointment_kind === 'CUSTOM' && $appointment->payment_requirement === 'INCLUDED', 'Link billing hanya untuk CUSTOM INCLUDED pasien yang sama.');
                    break;
                case 'receipts':
                    $payment = $find('payment_transactions', $attributes['payment_transaction_id'] ?? null);
                    $require($payment !== null && $payment->status === 'VERIFIED' && $payment->entry_type === 'RECEIPT', 'Receipt hanya untuk penerimaan nyata terverifikasi, bukan klaim/reversal.');
                    break;
                case 'payment_allocations':
                    $payment = $find('payment_transactions', $attributes['payment_transaction_id'] ?? null);
                    $billing = $find('billing_accounts', $attributes['billing_account_id'] ?? null);
                    $source = $payment ? $find('billing_accounts', $payment->billing_account_id) : null;
                    $require($payment !== null && $source !== null && $billing !== null && $payment->status === 'VERIFIED'
                        && $payment->entry_type === 'RECEIPT' && $source->patient_id === $billing->patient_id, 'Alokasi memerlukan kas verified dan billing pasien yang sama.');
                    if ($source->id !== $billing->id) {
                        $agreement = $find('payment_agreements', $payment->payment_agreement_id);
                        $appointment = $find('appointments', $billing->appointment_id);
                        $require($agreement !== null && $appointment !== null && $agreement->first_billing_account_id === $source->id
                            && $appointment->treatment_plan_id === $agreement->treatment_plan_id, 'Alokasi antar-invoice hanya dalam kesepakatan plan yang sama.');
                    }
                    $require(($attributes['amount'] ?? 0) > 0 && $attributes['amount'] <= $payment->amount, 'Nilai alokasi harus positif dan tidak melebihi kas asal.');
                    if (($attributes['entry_type'] ?? 'ALLOCATION') === 'REVERSAL') {
                        $original = $find('payment_allocations', $attributes['reversal_of_id'] ?? null);
                        $require($original !== null && $original->entry_type === 'ALLOCATION' && $original->payment_transaction_id === $payment->id
                            && $original->billing_account_id === $billing->id && (int) $original->amount === (int) $attributes['amount'], 'Reversal alokasi harus sama dengan alokasi asal.');
                    }
                    // SUM seluruh alokasi wajib dicek ulang di bawah lock transaksi pada action.
                    break;
            }
        });
    }
}
