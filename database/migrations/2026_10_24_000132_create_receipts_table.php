<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('payment_transaction_id', 36);
            $table->string('receipt_number', 60);
            $table->dateTime('issued_at', 6);
            $table->json('snapshot');
            $table->char('correction_of_receipt_id', 36)->nullable();
            $table->dateTime('created_at', 6);
            $table->unique(['receipt_number'], 'uq_receipts_receipt_number');
            $table->unique(['payment_transaction_id'], 'uq_receipts_payment_transaction_id');
            $table->index(['correction_of_receipt_id'], 'ix_receipts_correction_of_receipt_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
