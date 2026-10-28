<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consents', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('patient_id', 36);
            $table->char('appointment_id', 36)->nullable();
            $table->char('actor_user_id', 36)->nullable();
            $table->string('accepted_by_name_snapshot', 150);
            $table->char('recorded_by_user_id', 36);
            $table->string('document_key', 80);
            $table->unsignedInteger('document_version');
            $table->dateTime('accepted_at', 6);
            $table->dateTime('withdrawn_at', 6)->nullable();
            $table->string('acceptance_source', 30);
            $table->string('ip_address', 45)->nullable();
            $table->char('cms_content_id', 36);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->index(['patient_id', 'appointment_id'], 'ix_consents_patient_id_appointment_id');
            $table->index(['document_key', 'document_version'], 'ix_consents_document_key_document_version');
            $table->index(['appointment_id'], 'ix_consents_appointment_id');
            $table->index(['actor_user_id'], 'ix_consents_actor_user_id');
            $table->index(['recorded_by_user_id'], 'ix_consents_recorded_by_user_id');
            $table->index(['cms_content_id'], 'ix_consents_cms_content_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consents');
    }
};
