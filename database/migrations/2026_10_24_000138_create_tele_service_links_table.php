<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tele_service_links', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('appointment_id', 36);
            $table->unsignedInteger('attempt_number');
            $table->unsignedInteger('version');
            $table->text('meeting_url');
            $table->string('recipient_phone', 25);
            $table->char('recipient_user_id', 36)->nullable();
            $table->dateTime('recipient_confirmed_at', 6);
            $table->char('created_by', 36);
            $table->string('reason', 500);
            $table->dateTime('created_at', 6);
            $table->unique(['appointment_id', 'attempt_number', 'version'], 'uq_tele_service_links_appointment_id_attempt_number_version');
            $table->index(['recipient_user_id', 'created_at'], 'ix_tele_service_links_recipient_user_id_created_at');
            $table->index(['created_by'], 'ix_tele_service_links_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tele_service_links');
    }
};
