<?php

namespace App\Domain;

use App\Models\Appointment;
use App\Models\BillingAccount;
use App\Models\BillingLineItem;
use App\Models\DocumentSequence;
use App\Models\Invoice;
use App\Models\PaymentAgreement;
use App\Models\PaymentAllocation;
use App\Models\PaymentProof;
use App\Models\PaymentTransaction;
use App\Models\PrivateFile;
use App\Models\Receipt;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class Billing
{
    public function account(Appointment $appointment): ?BillingAccount
    {
        if ($appointment->payment_requirement->value === 'NOT_REQUIRED') {
            return null;
        }
        if ($appointment->payment_requirement->value === 'INCLUDED' && $appointment->appointment_kind->value === 'CUSTOM') {
            return BillingAccount::whereIn('id', DB::table('appointment_billing_links')->where('appointment_id', $appointment->id)->select('billing_account_id'))->firstOrFail();
        }

        return $appointment->assessment_case_id ? BillingAccount::where('assessment_case_id', $appointment->assessment_case_id)->firstOrFail() : BillingAccount::where('appointment_id', $appointment->id)->firstOrFail();
    }

    public function balance(BillingAccount $account): array
    {
        $total = (int) Invoice::where('billing_account_id', $account->id)->sum('net_amount');
        $allocations = PaymentAllocation::where('billing_account_id', $account->id)->selectRaw("COALESCE(SUM(CASE WHEN entry_type='ALLOCATION' THEN amount ELSE -CAST(amount AS SIGNED) END),0) AS total")->first();
        $received = (int) $allocations->getAttribute('total');
        $inPlan = $account->appointment_id && Appointment::whereKey($account->appointment_id)->whereNotNull('treatment_plan_id')->exists();
        if (! $inPlan) {
            $received = (int) PaymentTransaction::where('billing_account_id', $account->id)->where('status', 'VERIFIED')->selectRaw("COALESCE(SUM(CASE WHEN entry_type='RECEIPT' THEN amount ELSE -CAST(amount AS SIGNED) END),0) AS total")->first()->getAttribute('total');
        }

        return ['total_due' => $total, 'verified_received' => $received, 'remaining_amount' => max(0, $total - $received), 'overpaid_amount' => max(0, $received - $total),
            'payment_status' => $account->collection_status->value === 'CLOSED_UNSERVED' ? 'CLOSED_UNSERVED' : ($received >= $total ? 'PAID' : ($received > 0 ? 'PARTIAL' : 'UNPAID')), 'initial_requirement_met' => $received >= $account->initial_minimum_due];
    }

    public function initialMet(Appointment $appointment): bool
    {
        if ($appointment->payment_requirement->value === 'NOT_REQUIRED') {
            return true;
        }
        $account = $this->account($appointment);
        if ($appointment->treatment_plan_id && $appointment->session_number > 1) {
            $first = Appointment::where('treatment_plan_id', $appointment->treatment_plan_id)->where('session_number', 1)->whereNull('plan_unit_released_at')->firstOrFail();

            return $this->balance($this->account($first))['initial_requirement_met'];
        }

        return $this->balance($account)['initial_requirement_met'];
    }

    public function number(string $kind): string
    {
        $date = CarbonImmutable::now('Asia/Jakarta')->toDateString();
        DB::table('document_sequences')->insertOrIgnore(['id' => (string) Str::uuid(), 'document_kind' => $kind, 'local_date' => $date, 'next_value' => 1, 'created_at' => now(), 'updated_at' => now(), 'row_version' => 1]);
        $sequence = DocumentSequence::where('document_kind', $kind)->where('local_date', $date)->lockForUpdate()->firstOrFail();
        $value = $sequence->next_value;
        $sequence->update(['next_value' => $value + 1]);

        return 'JS-'.($kind === 'INVOICE' ? 'INV' : 'RCP').'-'.str_replace('-', '', $date).'-'.str_pad((string) $value, 6, '0', STR_PAD_LEFT);
    }

    public function base(User $actor, BillingAccount $account, Appointment $appointment, int $normal, int $net, string $label): Invoice
    {
        Access::check($normal > 0 && $net > 0 && $net <= $normal, 'Harga dasar bersih harus positif.');
        $invoice = Invoice::create(['billing_account_id' => $account->id, 'invoice_number' => $this->number('INVOICE'), 'kind' => 'BASE', 'net_amount' => $net, 'issued_at' => now(), 'issuer_id' => $actor->id,
            'identity_snapshot' => ['patient' => $appointment->identity_snapshot, 'booking_code' => $appointment->booking_code, 'start_at' => $appointment->start_at->toIso8601String(), 'practice' => app(Calendar::class)->settings()->practice_identity, 'template_version' => 1]]);
        $line = BillingLineItem::create(['invoice_id' => $invoice->id, 'appointment_id' => $appointment->id, 'kind' => 'BASE_SERVICE', 'direction' => 'PLUS', 'label' => $label, 'quantity' => 1, 'unit_amount' => $normal, 'amount' => $normal, 'created_by' => $actor->id,
            'metadata' => ['normal_price' => $normal, 'final_price' => $net]]);
        if ($normal > $net) {
            BillingLineItem::create(['invoice_id' => $invoice->id, 'appointment_id' => $appointment->id, 'kind' => 'GLOBAL_PROMO', 'direction' => 'MINUS', 'label' => 'Promo paket', 'quantity' => 1, 'unit_amount' => $normal - $net, 'amount' => $normal - $net, 'reference_line_id' => $line->id, 'created_by' => $actor->id]);
        }

        return $invoice;
    }

    public function adjustment(User $actor, BillingAccount $account, int $amount, string $kind, string $label, string $reason, ?string $reference = null, array $metadata = []): Invoice
    {
        Access::check($amount !== 0 && trim($reason) !== '', 'Nominal dan alasan penyesuaian wajib.');
        $base = Invoice::where('billing_account_id', $account->id)->where('kind', 'BASE')->firstOrFail();
        $invoice = Invoice::create(['billing_account_id' => $account->id, 'invoice_number' => $this->number('INVOICE'), 'kind' => $amount > 0 ? 'ADDENDUM' : 'ADJUSTMENT',
            'parent_invoice_id' => $base->id, 'net_amount' => $amount, 'issued_at' => now(), 'issuer_id' => $actor->id, 'identity_snapshot' => $base->identity_snapshot]);
        BillingLineItem::create(['invoice_id' => $invoice->id, 'appointment_id' => $account->appointment_id, 'kind' => $kind, 'direction' => $amount > 0 ? 'PLUS' : 'MINUS', 'label' => $label, 'quantity' => 1, 'unit_amount' => abs($amount), 'amount' => abs($amount),
            'reference_line_id' => $reference, 'metadata' => $metadata, 'created_by' => $actor->id, 'reason' => $reason]);
        Transactions::audit($actor, 'billing.adjustment', 'billing_accounts', $account->id, ['invoice_id' => $invoice->id], $reason);
        Transactions::bump($account);

        return $invoice;
    }

    public function source(BillingAccount $account): array
    {
        $appointment = $account->appointment_id ? Appointment::findOrFail($account->appointment_id) : null;
        $agreement = $appointment?->treatment_plan_id ? PaymentAgreement::where('treatment_plan_id', $appointment->treatment_plan_id)->first() : null;

        return [$agreement ? BillingAccount::findOrFail($agreement->first_billing_account_id) : $account, $agreement];
    }

    /** Recompute allocation journal under the plan + billing + receipt locks held by the action. */
    public function allocate(BillingAccount $account, User $actor): void
    {
        [$source,$agreement] = $this->source($account);
        $bills = $agreement ? BillingAccount::whereIn('appointment_id', Appointment::where('treatment_plan_id', $agreement->treatment_plan_id)->select('id'))->orderBy('id')->lockForUpdate()->get()
            ->sortBy(fn ($bill) => Appointment::findOrFail($bill->appointment_id)->session_number)->values() : collect([BillingAccount::whereKey($account->id)->lockForUpdate()->firstOrFail()]);
        $payments = PaymentTransaction::where('billing_account_id', $source->id)->where('entry_type', 'RECEIPT')->where('status', 'VERIFIED')
            ->whereNotIn('id', PaymentTransaction::where('entry_type', 'REVERSAL')->where('status', 'VERIFIED')->select('reversal_of_id'))->orderBy('received_at')->orderBy('id')->lockForUpdate()->get();
        $targets = $bills->mapWithKeys(fn ($bill) => [$bill->id => max(0, (int) Invoice::where('billing_account_id', $bill->id)->sum('net_amount'))])->all();
        $desired = [];
        foreach ($payments as $payment) {
            $available = $payment->amount;
            foreach ($bills as $bill) {
                $allocated = min($available, $targets[$bill->id]);
                if ($allocated > 0) {
                    $desired[$payment->id.':'.$bill->id] = [$payment->id, $bill->id, $allocated];
                }
                $targets[$bill->id] -= $allocated;
                $available -= $allocated;
            }
            // Unallocated money remains on the original receipt; it is not erased or a second receipt.
        }
        $existing = PaymentAllocation::whereIn('billing_account_id', $bills->pluck('id'))->where('entry_type', 'ALLOCATION')->whereNotIn('id', PaymentAllocation::where('entry_type', 'REVERSAL')->select('reversal_of_id'))->get();
        foreach ($existing as $entry) {
            $key = $entry->payment_transaction_id.':'.$entry->billing_account_id;
            if (isset($desired[$key]) && $desired[$key][2] === $entry->amount) {
                unset($desired[$key]);

                continue;
            }
            PaymentAllocation::create(['payment_transaction_id' => $entry->payment_transaction_id, 'billing_account_id' => $entry->billing_account_id, 'entry_type' => 'REVERSAL', 'amount' => $entry->amount, 'reversal_of_id' => $entry->id,
                'allocation_key' => (string) Str::uuid(), 'created_by' => $actor->id, 'reason' => 'Penyesuaian alokasi terhadap invoice/koreksi terbaru']);
        }
        foreach ($desired as [$payment,$bill,$amount]) {
            PaymentAllocation::create(['payment_transaction_id' => $payment, 'billing_account_id' => $bill, 'amount' => $amount, 'allocation_key' => (string) Str::uuid(), 'created_by' => $actor->id]);
        }
    }

    public function submit(User $actor, Appointment $appointment, int $claim, string $fileId, string $method, ?string $sender): PaymentTransaction
    {
        Access::patient($actor, $appointment->patient_id);
        Access::check($appointment->payment_requirement->value !== 'NOT_REQUIRED', 'Appointment ini tidak memerlukan pembayaran.');
        $file = PrivateFile::findOrFail($fileId);
        Access::check($file->uploaded_by === $actor->id && $file->purpose->value === 'PAYMENT_PROOF' && ! $file->purged_at, 'Berkas bukti tidak sah.');
        $account = $this->account($appointment);
        [$source,$agreement] = $this->source($account);
        $protected = $appointment->hold_expires_at && now()->lessThanOrEqualTo($appointment->hold_expires_at) && $appointment->status->value === 'WAITING_PAYMENT';
        $payment = PaymentTransaction::create(['billing_account_id' => $source->id, 'appointment_id' => $appointment->id, 'purpose' => 'DP', 'claimed_amount' => $claim, 'method' => $method, 'status' => 'PENDING_VERIFICATION',
            'sender_name' => $sender, 'submitted_by' => $actor->id, 'payment_agreement_id' => $agreement?->id]);
        PaymentProof::create(['payment_transaction_id' => $payment->id, 'file_id' => $file->id, 'version' => 1, 'received_at' => now(), 'decision' => 'PENDING']);
        if ($protected) {
            $appointment->update(['status' => 'WAITING_VERIFICATION', 'verification_started_at' => now(), 'verification_due_at' => app(Calendar::class)->addWorkingMinutes(CarbonImmutable::now(), 720, $appointment->calendar_version_id)]);
        }
        Transactions::outbox('PAYMENT_SUBMITTED', 'appointments', $appointment->id, ['patient_id' => $appointment->patient_id, 'payment_id' => $payment->id, 'attempt_number' => $appointment->attempt_number], $payment->row_version);

        return $payment;
    }

    public function verify(User $actor, PaymentTransaction $payment, int $amount, string $receivedAt, bool $duplicateAck = false, ?string $reason = null): void
    {
        Access::requireCashier($actor);
        Access::check($payment->status->value !== 'VERIFIED' && $payment->entry_type->value === 'RECEIPT', 'Pembayaran ini sudah terverifikasi.');
        $time = app(Calendar::class)->instant($receivedAt);
        Access::check($time->lessThanOrEqualTo(CarbonImmutable::now()) && $amount > 0, 'Nominal/tanggal penerimaan tidak sah.');
        $proof = PaymentProof::where('payment_transaction_id', $payment->id)->orderByDesc('version')->first();
        // Dua penerimaan nyata boleh memiliki nominal/metode/waktu yang sama.
        // Retry dilindungi idempotency transaksi; bukti identik tetap perlu ditinjau.
        $candidate = false;
        if ($proof) {
            $hash = PrivateFile::findOrFail($proof->file_id)->checksum_sha256;
            $candidate = PaymentTransaction::where('status', 'VERIFIED')->where('entry_type', 'RECEIPT')->where('id', '<>', $payment->id)
                ->whereIn('id', PaymentProof::whereIn('file_id', PrivateFile::where('checksum_sha256', $hash)->select('id'))->select('payment_transaction_id'))->exists();
        }
        Access::check(! $candidate || ($duplicateAck && filled($reason)), 'Ada kandidat pembayaran ganda. Periksa dan berikan konfirmasi beralasan.');
        $payment->update(['amount' => $amount, 'received_at' => $time, 'verified_at' => now(), 'verified_by' => $actor->id, 'status' => 'VERIFIED', 'reason' => $reason]);
        if ($proof) {
            $proof->update(['decision' => 'APPROVED']);
        }
        $account = BillingAccount::findOrFail($payment->billing_account_id);
        $this->allocate($account, $actor);
        Receipt::create(['payment_transaction_id' => $payment->id, 'receipt_number' => $this->number('RECEIPT'), 'issued_at' => now(),
            'snapshot' => ['amount' => $amount, 'received_at' => $time->toIso8601String(), 'method' => $payment->method->value, 'billing_account_id' => $account->id, 'balance' => $this->balance($account), 'practice' => app(Calendar::class)->settings()->practice_identity]]);
        $appointments = $account->assessment_case_id ? Appointment::where('assessment_case_id', $account->assessment_case_id)->get() : Appointment::whereKey($payment->appointment_id ?? $account->appointment_id)->get();
        foreach ($appointments as $appointment) {
            if (in_array($appointment->status->value, ['WAITING_PAYMENT', 'WAITING_VERIFICATION', 'CONFIRMED_AUTO_SLA'], true) && $this->initialMet($appointment)) {
                $appointment->update(['status' => 'CONFIRMED']);
            }
        }
        Transactions::audit($actor, 'payment.verified', 'payment_transactions', $payment->id, [], $reason);
        Transactions::outbox('PAYMENT_VERIFIED', 'billing_accounts', $account->id, ['patient_id' => $account->patient_id, 'payment_id' => $payment->id], $payment->row_version);
        if ($account->appointment_id && ($planId = Appointment::findOrFail($account->appointment_id)->treatment_plan_id)) {
            app(Operations::class)->settlePlan($planId);
        }
    }

    public function reject(User $actor, PaymentTransaction $payment, string $reason): void
    {
        Access::requireCashier($actor);
        Access::check($payment->status->value !== 'VERIFIED', 'Uang terverifikasi hanya dikoreksi dengan reversal.');
        $payment->update(['status' => 'REJECTED', 'reason' => $reason]);
        PaymentProof::where('payment_transaction_id', $payment->id)->orderByDesc('version')->first()?->update(['decision' => 'REJECTED', 'decision_reason' => $reason]);
        if ($payment->appointment_id) {
            $appointment = Appointment::findOrFail($payment->appointment_id);
            $deadline = CarbonImmutable::now()->addHours(app(Calendar::class)->settings()->proof_correction_hours);
            if ($appointment->hold_expires_at && $appointment->hold_expires_at->greaterThan($deadline)) {
                $deadline = CarbonImmutable::instance($appointment->hold_expires_at);
            }
            if ($deadline->greaterThan($appointment->start_at)) {
                $deadline = CarbonImmutable::instance($appointment->start_at);
            }
            $appointment->update(['correction_deadline_at' => $deadline->isFuture() ? $deadline : null]);
            Transactions::outbox('PAYMENT_REJECTED', 'appointments', $appointment->id, ['patient_id' => $appointment->patient_id, 'reason' => $reason, 'payment_id' => $payment->id, 'attempt_number' => $appointment->attempt_number], $payment->row_version);
        }
    }

    public function correctProof(User $actor, PaymentTransaction $payment, string $fileId, int $version): void
    {
        $account = BillingAccount::findOrFail($payment->billing_account_id);
        Access::patient($actor, $account->patient_id);
        Access::check($payment->status->value === 'REJECTED', 'Hanya bukti ditolak yang dapat diperbaiki.');
        $last = PaymentProof::where('payment_transaction_id', $payment->id)->orderByDesc('version')->firstOrFail();
        Access::check($last->version === $version, 'Versi bukti telah berubah.');
        $appointment = Appointment::findOrFail($payment->appointment_id);
        Access::check($appointment->correction_deadline_at?->isFuture() && ! in_array($appointment->status->value, ['CANCELLED', 'EXPIRED', 'COMPLETED'], true), 'Jendela koreksi berakhir; hubungi Admin untuk rekonsiliasi.');
        $file = PrivateFile::findOrFail($fileId);
        Access::check($file->uploaded_by === $actor->id && $file->purpose->value === 'PAYMENT_PROOF' && ! $file->purged_at, 'Berkas tidak sah.');
        PaymentProof::create(['payment_transaction_id' => $payment->id, 'file_id' => $file->id, 'version' => $version + 1, 'received_at' => now(), 'decision' => 'PENDING']);
        $payment->update(['status' => 'PENDING_VERIFICATION']);
        Transactions::outbox('PAYMENT_CORRECTED', 'appointments', $appointment->id, ['patient_id' => $appointment->patient_id, 'payment_id' => $payment->id, 'attempt_number' => $appointment->attempt_number], $payment->row_version);
    }

    public function closeUnserved(User $actor, BillingAccount $account, string $reason, ?int $partialRelease = null): void
    {
        $balance = $this->balance($account);
        $appointments = $account->assessment_case_id ? Appointment::where('assessment_case_id', $account->assessment_case_id) : Appointment::whereKey($account->appointment_id);
        $delivered = (clone $appointments)->whereIn('status', ['IN_CONSULTATION', 'COMPLETED'])->exists();
        if ($delivered) {
            Access::requireOwner($actor);
            Access::check($partialRelease !== null, 'Owner wajib menetapkan nominal bagian belum diberikan.');
        }
        $release = $delivered ? $partialRelease : $balance['remaining_amount'];
        Access::check($release >= 0 && $release <= $balance['remaining_amount'], 'Nilai pelepasan melampaui bagian yang dapat ditutup.');
        if ($release > 0) {
            $baseLine = BillingLineItem::whereIn('invoice_id', Invoice::where('billing_account_id', $account->id)->select('id'))->where('kind', 'BASE_SERVICE')->firstOrFail();
            $this->adjustment($actor, $account, -$release, 'CORRECTION', 'Pelepasan layanan belum diberikan', $reason, $baseLine->id, ['reason_code' => 'UNSERVED_RELEASE']);
        }
        $stillDue = $this->balance($account)['remaining_amount'];
        $account->update(['collection_status' => $stillDue > 0 ? 'OPEN' : 'CLOSED_UNSERVED', 'collection_closed_at' => $stillDue > 0 ? null : now(), 'collection_closure_reason' => $reason, 'service_terminal_at' => now(), 'download_until' => now()->addDays(7)]);
    }
}
