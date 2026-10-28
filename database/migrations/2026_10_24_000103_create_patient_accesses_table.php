<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_accesses', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('account_user_id', 36);
            $table->char('patient_id', 36);
            $table->string('relationship', 50);
            $table->string('status', 20)->default('ACTIVE');
            $table->char('verified_by', 36)->nullable();
            $table->dateTime('verified_at', 6)->nullable();
            $table->string('reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['account_user_id', 'patient_id'], 'uq_patient_accesses_account_user_id_patient_id');
            $table->index(['patient_id'], 'ix_patient_accesses_patient_id');
            $table->index(['verified_by'], 'ix_patient_accesses_verified_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_accesses');
    }
};
