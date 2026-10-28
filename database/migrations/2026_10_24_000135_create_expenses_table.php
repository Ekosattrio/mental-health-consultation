<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->date('expense_date');
            $table->string('category', 30);
            $table->string('description', 500);
            $table->unsignedBigInteger('amount');
            $table->string('entry_type', 20)->default('EXPENSE');
            $table->char('reversal_of_id', 36)->nullable();
            $table->char('correction_group_id', 36)->nullable();
            $table->char('attachment_file_id', 36)->nullable();
            $table->text('notes')->nullable();
            $table->char('created_by', 36);
            $table->string('reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->unique(['reversal_of_id'], 'uq_expenses_reversal_of_id');
            $table->index(['expense_date', 'category'], 'ix_expenses_expense_date_category');
            $table->index(['attachment_file_id'], 'ix_expenses_attachment_file_id');
            $table->index(['created_by'], 'ix_expenses_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
