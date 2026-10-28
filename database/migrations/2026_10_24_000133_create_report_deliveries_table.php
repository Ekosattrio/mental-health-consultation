<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_deliveries', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('billing_account_id', 36);
            $table->char('assessment_case_id', 36)->nullable();
            $table->char('appointment_id', 36)->nullable();
            $table->boolean('included');
            $table->string('status', 20)->default('REQUESTED');
            $table->string('delivery_method', 20)->default('OFFLINE');
            $table->char('issued_by', 36)->nullable();
            $table->dateTime('delivered_at', 6)->nullable();
            $table->string('administrative_note', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->index(['billing_account_id', 'status'], 'ix_report_deliveries_billing_account_id_status');
            $table->index(['assessment_case_id'], 'ix_report_deliveries_assessment_case_id');
            $table->index(['appointment_id'], 'ix_report_deliveries_appointment_id');
            $table->index(['issued_by'], 'ix_report_deliveries_issued_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_deliveries');
    }
};
