<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_allocations', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('payment_transaction_id', 36);
            $table->char('billing_account_id', 36);
            $table->string('entry_type', 20)->default('ALLOCATION');
            $table->unsignedBigInteger('amount');
            $table->char('reversal_of_id', 36)->nullable();
            $table->string('allocation_key', 150);
            $table->char('created_by', 36);
            $table->string('reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->unique(['allocation_key'], 'uq_payment_allocations_allocation_key');
            $table->unique(['reversal_of_id'], 'uq_payment_allocations_reversal_of_id');
            $table->index(['billing_account_id', 'created_at'], 'ix_payment_allocations_billing_account_id_created_at');
            $table->index(['payment_transaction_id', 'created_at'], 'ix_payment_allocations_payment_transaction_id_created_at');
            $table->index(['created_by'], 'ix_payment_allocations_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_allocations');
    }
};
