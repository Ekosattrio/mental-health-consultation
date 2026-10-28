<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pretest_submissions', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('patient_id', 36);
            $table->char('appointment_id', 36)->nullable();
            $table->char('template_id', 36);
            $table->char('author_user_id', 36);
            $table->string('status', 20)->default('DRAFT');
            $table->longText('answers');
            $table->char('supersedes_id', 36)->nullable();
            $table->dateTime('submitted_at', 6)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->index(['patient_id', 'appointment_id', 'submitted_at'], 'ix_pretest_submissions_patient_id_appointment_id__eb54727e');
            $table->unique(['supersedes_id'], 'uq_pretest_submissions_supersedes_id');
            $table->index(['appointment_id'], 'ix_pretest_submissions_appointment_id');
            $table->index(['template_id'], 'ix_pretest_submissions_template_id');
            $table->index(['author_user_id'], 'ix_pretest_submissions_author_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pretest_submissions');
    }
};
