<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_cases', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('patient_id', 36);
            $table->char('package_version_id', 36);
            $table->string('status', 40)->default('OPEN');
            $table->json('scope_snapshot');
            $table->char('created_by', 36);
            $table->dateTime('closed_at', 6)->nullable();
            $table->string('closure_reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->index(['patient_id', 'status', 'created_at'], 'ix_assessment_cases_patient_id_status_created_at');
            $table->index(['package_version_id'], 'ix_assessment_cases_package_version_id');
            $table->index(['created_by'], 'ix_assessment_cases_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_cases');
    }
};
