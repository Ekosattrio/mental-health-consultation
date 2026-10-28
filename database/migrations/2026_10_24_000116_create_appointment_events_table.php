<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_events', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('appointment_id', 36);
            $table->char('actor_id', 36)->nullable();
            $table->string('event_type', 60);
            $table->unsignedInteger('attempt_number');
            $table->json('old_value')->nullable();
            $table->json('new_value');
            $table->string('reason', 500)->nullable();
            $table->string('request_id', 80);
            $table->dateTime('created_at', 6);
            $table->index(['appointment_id', 'created_at'], 'ix_appointment_events_appointment_id_created_at');
            $table->index(['actor_id'], 'ix_appointment_events_actor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_events');
    }
};
