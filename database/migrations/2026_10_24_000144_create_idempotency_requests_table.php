<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idempotency_requests', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('actor_id', 36);
            $table->string('scope', 120);
            $table->string('request_key', 100);
            $table->char('payload_hash', 64);
            $table->string('status', 20)->default('PROCESSING');
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->json('response_snapshot')->nullable();
            $table->dateTime('expires_at', 6);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['actor_id', 'scope', 'request_key'], 'uq_idempotency_requests_actor_id_scope_request_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idempotency_requests');
    }
};
