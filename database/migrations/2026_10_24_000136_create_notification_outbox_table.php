<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_outbox', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('event_key', 150);
            $table->string('event_type', 80);
            $table->string('resource_type', 60);
            $table->char('resource_id', 36);
            $table->unsignedInteger('resource_version')->nullable();
            $table->json('payload');
            $table->dateTime('dispatched_at', 6)->nullable();
            $table->dateTime('available_at', 6)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['event_key'], 'uq_notification_outbox_event_key');
            $table->index(['dispatched_at', 'created_at'], 'ix_notification_outbox_dispatched_at_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_outbox');
    }
};
