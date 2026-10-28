<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_line_items', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('invoice_id', 36);
            $table->char('appointment_id', 36)->nullable();
            $table->string('kind', 30);
            $table->string('direction', 5)->default('PLUS');
            $table->string('label', 255);
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('unit_amount');
            $table->unsignedBigInteger('amount');
            $table->char('reference_line_id', 36)->nullable();
            $table->char('base_service_guard', 36)->nullable()->storedAs('CASE WHEN kind = \'BASE_SERVICE\' THEN invoice_id ELSE NULL END');
            $table->json('metadata')->nullable();
            $table->char('created_by', 36);
            $table->string('reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->unique(['base_service_guard'], 'uq_billing_line_items_base_service_guard');
            $table->index(['invoice_id', 'kind'], 'ix_billing_line_items_invoice_id_kind');
            $table->index(['appointment_id'], 'ix_billing_line_items_appointment_id');
            $table->index(['reference_line_id'], 'ix_billing_line_items_reference_line_id');
            $table->index(['created_by'], 'ix_billing_line_items_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_line_items');
    }
};
