<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treatment_plans', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('patient_id', 36);
            $table->char('package_id', 36);
            $table->char('psychologist_id', 36);
            $table->unsignedInteger('planned_sessions')->default(4);
            $table->string('status', 40)->default('ACTIVE');
            $table->string('active_plan_guard', 73)->nullable()->storedAs('CASE WHEN status IN (\'ACTIVE\',\'AWAITING_SETTLEMENT\') THEN CONCAT(patient_id,\':\',package_id) ELSE NULL END');
            $table->text('clinical_objective')->nullable();
            $table->dateTime('completed_at', 6)->nullable();
            $table->dateTime('discontinued_at', 6)->nullable();
            $table->string('reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->index(['patient_id', 'package_id', 'status'], 'ix_treatment_plans_patient_id_package_id_status');
            $table->unique(['active_plan_guard'], 'uq_treatment_plans_active_plan_guard');
            $table->index(['package_id'], 'ix_treatment_plans_package_id');
            $table->index(['psychologist_id'], 'ix_treatment_plans_psychologist_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treatment_plans');
    }
};
