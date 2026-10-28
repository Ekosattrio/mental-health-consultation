<?php

namespace App\Models;

use App\Enums\ExpenseCategory;
use App\Enums\ExpenseEntryType;
use App\Models\Concerns\ImmutableDomainModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** expenses: penyimpanan domain; authorization/DTO tetap wajib pada lapisan HTTP berikutnya. */
class Expense extends ImmutableDomainModel
{
    protected $attributes = ['entry_type' => 'EXPENSE'];

    protected $table = 'expenses';

    protected $guarded = ['id', 'created_at', 'updated_at', 'row_version'];

    protected function casts(): array
    {
        return [
            'expense_date' => 'immutable_date',
            'category' => ExpenseCategory::class,
            'amount' => 'integer',
            'entry_type' => ExpenseEntryType::class,
        ];
    }

    public function reversalOf(): BelongsTo
    {
        return $this->belongsTo(Expense::class, 'reversal_of_id');
    }

    public function attachmentFile(): BelongsTo
    {
        return $this->belongsTo(PrivateFile::class, 'attachment_file_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'reversal_of_id');
    }
}
