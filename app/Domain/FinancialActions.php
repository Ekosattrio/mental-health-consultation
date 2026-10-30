<?php

namespace App\Domain;

use App\Models\AdditionalTimeEntry;
use App\Models\Appointment;
use App\Models\BillingAccount;
use App\Models\BillingLineItem;
use App\Models\Invoice;
use App\Models\PackageVersion;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Str;

final class FinancialActions
{
    public function __construct(private Billing $billing) {}

    public function record(User $actor, Appointment $appointment, array $input): PaymentTransaction
    {
        Access::requireCashier($actor);
        $account = $this->billing->account($appointment);
        Access::check($account !== null, 'Tanpa biaya tidak dicatat sebagai pembayaran nol.');
        [$source,$agreement] = $this->billing->source($account);
        $payment = PaymentTransaction::create(['billing_account_id' => $source->id, 'appointment_id' => $appointment->id, 'purpose' => $input['purpose'] ?? 'SETTLEMENT', 'method' => $input['method'],
            'claimed_amount' => $input['amount'], 'status' => 'PENDING_VERIFICATION', 'submitted_by' => $actor->id, 'reference' => $input['reference'] ?? null, 'payment_agreement_id' => $agreement?->id]);
        $this->billing->verify($actor, $payment, $input['amount'], $input['received_at'], $input['duplicate_review_acknowledged'] ?? false, $input['reason'] ?? null);
        if ($appointment->treatment_plan_id) {
            app(Operations::class)->settlePlan($appointment->treatment_plan_id);
        }

        return $payment;
    }

    public function correct(User $actor, PaymentTransaction $payment, array $input): ?PaymentTransaction
    {
        Access::requireCashier($actor);
        Access::check($payment->status->value === 'VERIFIED' && $payment->entry_type->value === 'RECEIPT' && ! PaymentTransaction::where('reversal_of_id', $payment->id)->exists(), 'Penerimaan tidak dapat dikoreksi lagi.');
        $group = (string) Str::uuid();
        PaymentTransaction::create(['billing_account_id' => $payment->billing_account_id, 'appointment_id' => $payment->appointment_id, 'entry_type' => 'REVERSAL', 'purpose' => 'CORRECTION', 'amount' => $payment->amount,
            'method' => $payment->method->value, 'status' => 'VERIFIED', 'received_at' => $payment->received_at, 'verified_at' => now(), 'verified_by' => $actor->id, 'submitted_by' => $actor->id, 'reversal_of_id' => $payment->id, 'correction_group_id' => $group,
            'reason' => $input['reason'], 'payment_agreement_id' => $payment->payment_agreement_id]);
        $replacement = null;
        if ($input['correct_amount'] > 0) {
            $replacement = PaymentTransaction::create(['billing_account_id' => $payment->billing_account_id, 'appointment_id' => $payment->appointment_id, 'purpose' => 'CORRECTION', 'method' => $payment->method->value,
                'status' => 'PENDING_VERIFICATION', 'submitted_by' => $actor->id, 'reference' => $payment->reference, 'correction_group_id' => $group, 'reason' => $input['reason'], 'payment_agreement_id' => $payment->payment_agreement_id]);
            $this->billing->verify($actor, $replacement, $input['correct_amount'], $input['received_at'], true, $input['reason']);
        }
        $this->billing->allocate(BillingAccount::findOrFail($payment->billing_account_id), $actor);
        $this->settle(BillingAccount::findOrFail($payment->billing_account_id));
        Transactions::audit($actor, 'payment.correction', 'payment_transactions', $payment->id, ['replacement_id' => $replacement?->id], $input['reason']);

        return $replacement;
    }

    public function charge(User $actor, BillingAccount $bill, array $input): void
    {
        Access::requireOwner($actor);
        Access::check($bill->collection_status->value === 'OPEN', 'Tagihan sudah ditutup.');
        Access::check($input['amount'] > 0, 'Biaya wajib positif.');
        if ($input['kind'] === 'FORMAL_REPORT') {
            Access::check(! $bill->assessment_case_id, 'Laporan asesmen sudah termasuk paket.');
            $appointment = Appointment::findOrFail($bill->appointment_id);
            $version = PackageVersion::findOrFail($appointment->package_version_id);
            Access::check($version->package->category->value === 'COUNSELING', 'Laporan berbayar ini khusus Konseling.');
            Access::check($input['amount'] === 200000, 'Biaya laporan formal Rp200.000.');
        }
        $this->billing->adjustment($actor, $bill, $input['amount'], $input['kind'], $input['label'], $input['reason']);
        $this->billing->allocate($bill, $actor);
        $this->settle($bill);
    }

    public function discount(User $actor, BillingAccount $bill, array $input): void
    {
        Access::requireOwner($actor);
        Access::check($bill->collection_status->value === 'OPEN', 'Tagihan sudah ditutup.');
        $line = BillingLineItem::whereKey($input['target_line_id'])->firstOrFail();
        $invoice = Invoice::findOrFail($line->invoice_id);
        Access::check($invoice->billing_account_id === $bill->id && $line->direction->value === 'PLUS', 'Target diskon tidak sah.');
        $deducted = (int) BillingLineItem::where('reference_line_id', $line->id)->where('direction', 'MINUS')->sum('amount');
        $balance = $this->billing->balance($bill);
        Access::check($input['amount'] > 0 && $input['amount'] < $line->amount - $deducted && $balance['verified_received'] <= $balance['total_due'] - $input['amount'], 'Diskon melampaui dasar net atau uang yang telah diterima.');
        $this->billing->adjustment($actor, $bill, -$input['amount'], 'PERSONAL_DISCOUNT', 'Potongan khusus', $input['reason'], $line->id);
        if ($line->kind->value === 'BASE_SERVICE' && $bill->initial_minimum_due > 0) {
            $policy = $bill->initial_payment_policy_snapshot;
            $net = $line->amount - $deducted - $input['amount'];
            $minimum = ($policy['mode'] ?? 'PERCENT') === 'FIXED' ? min($policy['fixed_amount'], $net) : (int) ceil($net * $policy['basis_points'] / 10000);
            $bill->update(['initial_minimum_due' => $minimum]);
        }
        $this->billing->allocate($bill, $actor);
        $this->settle($bill);
    }

    public function additionalTime(User $actor, Appointment $appointment, array $input): void
    {
        Access::requireOwner($actor);
        Access::check(in_array($appointment->status->value, ['IN_CONSULTATION', 'COMPLETED'], true), 'Waktu tambahan hanya untuk layanan yang telah berlangsung.');
        $version = PackageVersion::findOrFail($appointment->package_version_id);
        Access::check($version->package->category->value === 'COUNSELING', 'Tarif overtime hanya Konseling.');
        $last = AdditionalTimeEntry::where('appointment_id', $appointment->id)->where('attempt_number', $appointment->attempt_number)->orderByDesc('revision')->first();
        Access::check(($last?->revision ?? 0) === $input['expected_revision'], 'Revisi waktu tambahan sudah berubah.');
        $bill = $this->billing->account($appointment);
        $base = BillingLineItem::whereIn('invoice_id', Invoice::where('billing_account_id', $bill->id)->where('kind', 'BASE')->select('id'))->where('kind', 'BASE_SERVICE')->firstOrFail();
        $basis = $last?->rate_basis->value ?? $version->additional_time_price_basis?->value;
        Access::check($basis !== null, 'Basis tarif pada versi paket belum ditentukan.');
        $rate = $last?->base_rate_snapshot ?? ($basis === 'NORMAL_PRICE' ? $version->normal_price : $base->metadata['final_price']);
        $total = (int) $input['total_additional_minutes'];
        $blocks = (int) ceil($total / 15);
        $amount = (int) ceil($rate * 2500 * $blocks / 10000);
        $delta = $amount - ($last?->calculated_total ?? 0);
        $invoice = null;
        if ($delta !== 0) {
            $reference = $delta < 0 ? BillingLineItem::whereIn('invoice_id', Invoice::where('billing_account_id', $bill->id)->select('id'))->where('kind', 'ADDITIONAL_TIME')->latest('created_at')->firstOrFail()->id : null;
            $invoice = $this->billing->adjustment($actor, $bill, $delta, $delta > 0 ? 'ADDITIONAL_TIME' : 'CORRECTION', 'Waktu tambahan Konseling', $input['reason'], $reference, ['blocks' => $blocks, 'total_minutes' => $total, 'basis' => $basis, 'rate' => $rate]);
        }
        AdditionalTimeEntry::create(['appointment_id' => $appointment->id, 'attempt_number' => $appointment->attempt_number, 'revision' => ($last?->revision ?? 0) + 1, 'total_additional_minutes' => $total, 'billed_blocks' => $blocks, 'base_rate_snapshot' => $rate,
            'rate_basis' => $basis, 'rate_basis_points' => 2500, 'calculated_total' => $amount, 'invoice_id' => $invoice?->id, 'created_by' => $actor->id, 'reason' => $input['reason']]);
        $this->billing->allocate($bill, $actor);
    }

    private function settle(BillingAccount $bill): void
    {
        $appointment = $bill->appointment_id ? Appointment::find($bill->appointment_id) : null;
        if ($appointment?->treatment_plan_id) {
            app(Operations::class)->settlePlan($appointment->treatment_plan_id);
        }
    }
}
