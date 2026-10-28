<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_events', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('payment_transaction_id', 36);
            $table->char('actor_id', 36)->nullable();
            $table->string('event_type', 60);
            $table->string('from_status', 40)->nullable();
            $table->string('to_status', 40);
            $table->string('reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->index(['payment_transaction_id', 'created_at'], 'ix_payment_events_payment_transaction_id_created_at');
            $table->index(['actor_id'], 'ix_payment_events_actor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_events');
    }
};
