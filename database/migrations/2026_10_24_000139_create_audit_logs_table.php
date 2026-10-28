<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('actor_id', 36)->nullable();
            $table->string('action', 100);
            $table->string('resource_type', 60);
            $table->char('resource_id', 36);
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->string('reason', 500)->nullable();
            $table->string('request_id', 80);
            $table->string('ip_address', 45)->nullable();
            $table->dateTime('created_at', 6);
            $table->index(['resource_type', 'resource_id', 'created_at'], 'ix_audit_logs_resource_type_resource_id_created_at');
            $table->index(['actor_id', 'created_at'], 'ix_audit_logs_actor_id_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
