<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('billing_account_id', 36);
            $table->string('invoice_number', 60);
            $table->string('kind', 20);
            $table->char('parent_invoice_id', 36)->nullable();
            $table->bigInteger('net_amount');
            $table->dateTime('issued_at', 6);
            $table->char('issuer_id', 36);
            $table->json('identity_snapshot');
            $table->char('base_guard', 36)->nullable()->storedAs('CASE WHEN kind = \'BASE\' THEN billing_account_id ELSE NULL END');
            $table->dateTime('created_at', 6);
            $table->unique(['invoice_number'], 'uq_invoices_invoice_number');
            $table->unique(['base_guard'], 'uq_invoices_base_guard');
            $table->index(['billing_account_id', 'issued_at'], 'ix_invoices_billing_account_id_issued_at');
            $table->index(['parent_invoice_id'], 'ix_invoices_parent_invoice_id');
            $table->index(['issuer_id'], 'ix_invoices_issuer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
