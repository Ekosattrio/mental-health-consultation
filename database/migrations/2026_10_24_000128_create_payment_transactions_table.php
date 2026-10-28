<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('billing_account_id', 36);
            $table->char('appointment_id', 36)->nullable();
            $table->string('entry_type', 20)->default('RECEIPT');
            $table->string('purpose', 20);
            $table->unsignedBigInteger('claimed_amount')->nullable();
            $table->unsignedBigInteger('amount')->nullable();
            $table->string('method', 20);
            $table->string('status', 40);
            $table->string('reference', 150)->nullable();
            $table->string('sender_name', 150)->nullable();
            $table->dateTime('received_at', 6)->nullable();
            $table->dateTime('verified_at', 6)->nullable();
            $table->char('verified_by', 36)->nullable();
            $table->char('submitted_by', 36);
            $table->char('reversal_of_id', 36)->nullable();
            $table->char('correction_group_id', 36)->nullable();
            $table->string('reason', 500)->nullable();
            $table->char('payment_agreement_id', 36)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['reversal_of_id'], 'uq_payment_transactions_reversal_of_id');
            $table->index(['billing_account_id', 'received_at'], 'ix_payment_transactions_billing_account_id_received_at');
            $table->index(['status', 'created_at'], 'ix_payment_transactions_status_created_at');
            $table->index(['appointment_id'], 'ix_payment_transactions_appointment_id');
            $table->index(['verified_by'], 'ix_payment_transactions_verified_by');
            $table->index(['submitted_by'], 'ix_payment_transactions_submitted_by');
            $table->index(['payment_agreement_id'], 'ix_payment_transactions_payment_agreement_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
