<?php

namespace App\Http\Controllers;

use App\Domain\Access;
use App\Domain\Reports;
use App\Domain\Transactions;
use App\Models\Expense;
use App\Models\PrivateFile;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class FinanceController extends DomainController
{
    private function range(Request $request): array
    {
        return $request->validate(['from' => 'required|date_format:Y-m-d', 'to' => 'required|date_format:Y-m-d|after_or_equal:from|before:+367 days', 'as_of' => 'nullable|date|before_or_equal:now']);
    }

    public function show(Request $request): mixed
    {
        $input = $this->range($request);
        Access::check(CarbonImmutable::parse($input['from'])->diffInDays($input['to']) <= 366, 'Rentang maksimal366hari.');

        return response()->json(['data' => DB::transaction(fn () => app(Reports::class)->finance($request->user(), $input['from'], $input['to'], $input['as_of'] ?? null))]);
    }

    public function export(Request $request): mixed
    {
        $input = [...$this->range($request), ...$request->validate(['kind' => 'required|in:SCHEDULE,FINANCE', 'format' => 'required|in:CSV,XLSX'])];
        Access::check(CarbonImmutable::parse($input['from'])->diffInDays($input['to']) <= 366, 'Rentang maksimal366hari.');

        return $this->execute($request, 'export.request', $input, fn () => ['id' => app(Reports::class)->export($request->user(), $input)->id]);
    }

    public function expense(Request $request, ?string $expense = null): mixed
    {
        Access::requireOwner($request->user());
        $input = $request->validate(['expense_date' => 'required|date_format:Y-m-d|before_or_equal:'.CarbonImmutable::now('Asia/Jakarta')->toDateString().'', 'category' => 'required|in:RENT,ELECTRICITY,INTERNET,SUPPLIES,OPERATIONS,STAFF,OTHER', 'description' => 'required|string|max:500', 'amount' => 'required|integer|min:'.($expense ? '0' : '1').'|max:1000000000', 'attachment_file_id' => 'nullable|uuid', 'notes' => 'nullable|string|max:1000', 'reason' => 'required|string|min:3|max:500']);

        return $this->execute($request, 'expense.record.'.($expense ?? 'new'), $input, function () use ($request, $expense, $input) {
            if (! empty($input['attachment_file_id'])) {
                $file = PrivateFile::findOrFail($input['attachment_file_id']);
                Access::check($file->purpose->value === 'EXPENSE' && ! $file->purged_at && $file->uploaded_by === $request->user()->id, 'Lampiran pengeluaran tidak sah.');
            }
            $group = $expense ? (string) Str::uuid() : null;
            if ($expense) {
                $old = Expense::whereKey($expense)->lockForUpdate()->firstOrFail();
                Access::check($old->entry_type->value === 'EXPENSE' && ! Expense::where('reversal_of_id', $old->id)->exists(), 'Pengeluaran sudah dikoreksi.');
                $reversal = Expense::create(['expense_date' => $old->expense_date, 'category' => $old->category->value, 'description' => $old->description, 'amount' => $old->amount, 'entry_type' => 'REVERSAL', 'reversal_of_id' => $old->id, 'correction_group_id' => $group, 'created_by' => $request->user()->id, 'reason' => $input['reason']]);
            }
            $record = $input['amount'] > 0 ? Expense::create([...$input, 'entry_type' => 'EXPENSE', 'correction_group_id' => $group, 'created_by' => $request->user()->id]) : $reversal;
            Transactions::audit($request->user(), 'expense.record', 'expenses', $record->id, [], $input['reason']);

            return ['id' => $record->id];
        });
    }
}
