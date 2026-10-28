<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('outbox_id', 36);
            $table->char('recipient_user_id', 36)->nullable();
            $table->string('recipient_phone_snapshot', 25)->nullable();
            $table->char('tele_service_link_id', 36)->nullable();
            $table->string('channel', 20);
            $table->string('template_key', 80);
            $table->string('deduplication_key', 180);
            $table->string('status', 20)->default('QUEUED');
            $table->unsignedInteger('attempt_count')->default(0);
            $table->dateTime('next_retry_at', 6)->nullable();
            $table->dateTime('sent_at', 6)->nullable();
            $table->dateTime('read_at', 6)->nullable();
            $table->string('last_error', 500)->nullable();
            $table->string('provider_reference', 150)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['deduplication_key'], 'uq_notifications_deduplication_key');
            $table->index(['status', 'next_retry_at'], 'ix_notifications_status_next_retry_at');
            $table->index(['recipient_user_id', 'created_at'], 'ix_notifications_recipient_user_id_created_at');
            $table->index(['outbox_id'], 'ix_notifications_outbox_id');
            $table->index(['tele_service_link_id'], 'ix_notifications_tele_service_link_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
