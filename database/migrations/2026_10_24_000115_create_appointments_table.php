<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('booking_code', 40);
            $table->char('patient_id', 36);
            $table->char('booked_by_user_id', 36);
            $table->char('psychologist_id', 36);
            $table->char('package_version_id', 36)->nullable();
            $table->char('assessment_case_id', 36)->nullable();
            $table->string('assessment_role', 20)->nullable();
            $table->unsignedInteger('assessment_sequence')->nullable();
            $table->string('profiling_mode', 10)->default('DIGITAL');
            $table->char('treatment_plan_id', 36)->nullable();
            $table->unsignedInteger('session_number')->nullable();
            $table->dateTime('plan_unit_released_at', 6)->nullable();
            $table->string('plan_session_guard', 75)->nullable()->storedAs('CASE WHEN treatment_plan_id IS NOT NULL AND plan_unit_released_at IS NULL THEN CONCAT(treatment_plan_id,\':\',session_number) ELSE NULL END');
            $table->unsignedInteger('attempt_number')->default(1);
            $table->dateTime('start_at', 6);
            $table->dateTime('end_at', 6);
            $table->string('status', 40)->default('WAITING_PAYMENT');
            $table->string('booking_source', 30);
            $table->char('responsible_user_id', 36)->nullable();
            $table->json('identity_snapshot');
            $table->string('tele_service_recipient_phone', 25)->nullable();
            $table->dateTime('tele_service_wa_accepted_at', 6)->nullable();
            $table->char('calendar_version_id', 36);
            $table->dateTime('hold_expires_at', 6)->nullable();
            $table->dateTime('verification_started_at', 6)->nullable();
            $table->dateTime('verification_due_at', 6)->nullable();
            $table->dateTime('correction_deadline_at', 6)->nullable();
            $table->boolean('requires_reschedule')->default(false);
            $table->dateTime('checked_in_at', 6)->nullable();
            $table->char('checked_in_by', 36)->nullable();
            $table->dateTime('actual_started_at', 6)->nullable();
            $table->dateTime('actual_ended_at', 6)->nullable();
            $table->dateTime('terminal_at', 6)->nullable();
            $table->string('appointment_kind', 30)->default('STANDARD_SERVICE');
            $table->string('payment_requirement', 20)->default('REQUIRED');
            $table->string('custom_label', 180)->nullable();
            $table->string('custom_notes', 1000)->nullable();
            $table->unsignedBigInteger('custom_fee_amount')->nullable();
            $table->string('owner_authorization_note', 500)->nullable();
            $table->dateTime('external_agreed_at', 6)->nullable();
            $table->unsignedInteger('lead_working_minutes_snapshot')->default(180);
            $table->unsignedInteger('reminder_lead_minutes_snapshot')->default(120);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['booking_code'], 'uq_appointments_booking_code');
            $table->unique(['plan_session_guard'], 'uq_appointments_plan_session_guard');
            $table->unique(['assessment_case_id', 'assessment_sequence'], 'uq_appointments_assessment_case_id_assessment_sequence');
            $table->index(['psychologist_id', 'start_at', 'end_at', 'status'], 'ix_appointments_psychologist_id_start_at_end_at_status');
            $table->index(['patient_id', 'created_at'], 'ix_appointments_patient_id_created_at');
            $table->index(['booked_by_user_id'], 'ix_appointments_booked_by_user_id');
            $table->index(['package_version_id'], 'ix_appointments_package_version_id');
            $table->index(['treatment_plan_id'], 'ix_appointments_treatment_plan_id');
            $table->index(['responsible_user_id'], 'ix_appointments_responsible_user_id');
            $table->index(['calendar_version_id'], 'ix_appointments_calendar_version_id');
            $table->index(['checked_in_by'], 'ix_appointments_checked_in_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
