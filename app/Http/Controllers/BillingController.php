<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Billing;
use App\Domain\FinancialActions;
use App\Domain\Operations;
use App\Models\Appointment;
use App\Models\BillingAccount;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;

final class BillingController extends DomainController
{
    private function lockBill(string $id): BillingAccount
    {
        $bill = BillingAccount::findOrFail($id);
        $appointment = $bill->appointment_id ?? Appointment::where('assessment_case_id', $bill->assessment_case_id)->orderBy('assessment_sequence')->firstOrFail()->id;
        app(Operations::class)->lock($appointment);

        return $bill->refresh();
    }

    public function submit(Request $request, string $appointment): mixed
    {
        $input = $request->validate(['claimed_amount' => 'required|integer|min:1|max:1000000000', 'file_id' => 'required|uuid', 'method' => 'required|in:TRANSFER,QR', 'sender_name' => 'nullable|string|max:150']);

        return $this->execute($request, 'payment.submit.'.$appointment, $input, function () use ($request, $appointment, $input) {
            $record = app(Operations::class)->lock($appointment);
            Access::patient($request->user(), $record->patient_id);

            return ['id' => app(Billing::class)->submit($request->user(), $record, $input['claimed_amount'], $input['file_id'], $input['method'], $input['sender_name'] ?? null)->id];
        });
    }

    public function record(Request $request, string $appointment): mixed
    {
        Access::requireCashier($request->user());
        $input = $request->validate(['amount' => 'required|integer|min:1|max:1000000000', 'received_at' => 'required|date|before_or_equal:now', 'method' => 'required|in:TRANSFER,QR,CASH,EDC,OTHER', 'purpose' => 'required|in:DP,SETTLEMENT,ADD_ON', 'reference' => 'nullable|string|max:150', 'reason' => 'nullable|string|max:500', 'duplicate_review_acknowledged' => 'sometimes|boolean']);

        return $this->execute($request, 'payment.record.'.$appointment, $input, fn () => ['id' => app(FinancialActions::class)->record($request->user(), app(Operations::class)->lock($appointment), $input)->id]);
    }

    public function payment(Request $request, string $payment, string $action): mixed
    {
        if ($action !== 'proof') {
            Access::requireCashier($request->user());
        }
        $rules = match ($action) {
            'verify' => ['actual_amount' => 'required|integer|min:1|max:1000000000', 'received_at' => 'required|date|before_or_equal:now', 'duplicate_review_acknowledged' => 'sometimes|boolean', 'reason' => 'nullable|string|max:500'],
            'reject' => ['reason' => 'required|string|min:3|max:500'],'corrections' => ['correct_amount' => 'required|integer|min:0|max:1000000000', 'received_at' => 'required|date|before_or_equal:now', 'reason' => 'required|string|min:3|max:500'],
            'proof' => ['file_id' => 'required|uuid', 'expected_proof_version' => 'required|integer|min:1'],default => abort(404)
        };
        $input = $request->validate([...$rules, 'expected_version' => 'required|integer|min:1']);

        return $this->execute($request, 'payment.'.$action.'.'.$payment, $input, function () use ($request, $payment, $action, $input) {
            $read = PaymentTransaction::findOrFail($payment);
            $this->lockBill($read->billing_account_id);
            $record = PaymentTransaction::whereKey($payment)->lockForUpdate()->firstOrFail();
            $this->version($record, $input['expected_version']);
            $billing = app(Billing::class);
            match ($action) {
                'verify' => $billing->verify($request->user(), $record, $input['actual_amount'], $input['received_at'], $input['duplicate_review_acknowledged'] ?? false, $input['reason'] ?? null),
                'reject' => $billing->reject($request->user(), $record, $input['reason']),'proof' => $billing->correctProof($request->user(), $record, $input['file_id'], $input['expected_proof_version']),
                'corrections' => app(FinancialActions::class)->correct($request->user(), $record, $input)
            };

            return ['id' => $payment];
        });
    }

    public function change(Request $request, string $billing, string $action): mixed
    {
        Access::requireStaff($request->user());
        $rules = $action === 'discounts' ? ['amount' => 'required|integer|min:1|max:1000000000', 'target_line_id' => 'required|uuid'] : ['amount' => 'required|integer|min:1|max:1000000000', 'kind' => 'required|in:CUSTOM_CHARGE,FORMAL_REPORT', 'label' => 'required|string|max:255'];
        $input = $request->validate([...$rules, 'reason' => 'required|string|min:3|max:500', 'expected_version' => 'required|integer|min:1']);

        return $this->execute($request, 'billing.'.$action.'.'.$billing, $input, function () use ($request, $billing, $action, $input) {
            $bill = $this->lockBill($billing);
            $this->version($bill, $input['expected_version']);
            $service = app(FinancialActions::class);
            if ($action === 'discounts') {
                $service->discount($request->user(), $bill, $input);
            } else {
                $service->charge($request->user(), $bill, $input);
            }

return ['id' => $bill->id];
        });
    }

    public function time(Request $request, string $appointment): mixed
    {
        Access::requireStaff($request->user());
        $input = $request->validate(['total_additional_minutes' => 'required|integer|min:0|max:480', 'expected_revision' => 'required|integer|min:0', 'expected_version' => 'required|integer|min:1', 'reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'billing.overtime.'.$appointment, $input, function () use ($request, $appointment, $input) {
            $record = app(Operations::class)->lock($appointment);
            $this->version($record,$input['expected_version']);
            app(FinancialActions::class)->additionalTime($request->user(),$record,$input);

            return ['id' => $appointment];
        });
    }
}
