<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_accounts', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('patient_id', 36);
            $table->char('appointment_id', 36)->nullable();
            $table->char('assessment_case_id', 36)->nullable();
            $table->unsignedBigInteger('initial_minimum_due');
            $table->string('collection_status', 30)->default('OPEN');
            $table->dateTime('collection_closed_at', 6)->nullable();
            $table->string('collection_closure_reason', 500)->nullable();
            $table->dateTime('service_terminal_at', 6)->nullable();
            $table->dateTime('download_until', 6)->nullable();
            $table->json('initial_payment_policy_snapshot');
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['appointment_id'], 'uq_billing_accounts_appointment_id');
            $table->unique(['assessment_case_id'], 'uq_billing_accounts_assessment_case_id');
            $table->index(['patient_id'], 'ix_billing_accounts_patient_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_accounts');
    }
};
