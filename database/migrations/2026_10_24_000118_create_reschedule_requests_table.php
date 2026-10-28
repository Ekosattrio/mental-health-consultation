<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reschedule_requests', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('appointment_id', 36);
            $table->char('requested_by', 36);
            $table->string('origin', 20);
            $table->string('status', 40)->default('REQUESTED');
            $table->dateTime('requested_at', 6);
            $table->dateTime('eligibility_checked_at', 6);
            $table->unsignedInteger('appointment_version');
            $table->unsignedInteger('appointment_attempt_number');
            $table->string('reason_code', 60)->nullable();
            $table->string('owner_authorization_note', 500)->nullable();
            $table->json('old_interval');
            $table->dateTime('requested_start_at', 6)->nullable();
            $table->dateTime('requested_end_at', 6)->nullable();
            $table->string('reason', 500);
            $table->char('approved_by', 36)->nullable();
            $table->dateTime('approved_at', 6)->nullable();
            $table->dateTime('selection_expires_at', 6)->nullable();
            $table->boolean('requires_resolution')->default(false);
            $table->dateTime('applied_at', 6)->nullable();
            $table->unsignedTinyInteger('quota_effect')->default(0);
            $table->char('active_guard', 36)->nullable()->storedAs('CASE WHEN status IN (\'REQUESTED\',\'APPROVED\',\'SLOT_SELECTION_REQUIRED\') OR requires_resolution = 1 THEN appointment_id ELSE NULL END');
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['active_guard'], 'uq_reschedule_requests_active_guard');
            $table->index(['appointment_id', 'status'], 'ix_reschedule_requests_appointment_id_status');
            $table->index(['requested_by'], 'ix_reschedule_requests_requested_by');
            $table->index(['approved_by'], 'ix_reschedule_requests_approved_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reschedule_requests');
    }
};
