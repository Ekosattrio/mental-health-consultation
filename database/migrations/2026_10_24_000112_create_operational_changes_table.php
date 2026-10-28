<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_changes', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('calendar_version_id', 36)->nullable();
            $table->char('actor_id', 36);
            $table->string('reason', 500);
            $table->dateTime('effective_at', 6);
            $table->json('before_snapshot');
            $table->json('after_snapshot');
            $table->dateTime('created_at', 6);
            $table->index(['effective_at'], 'ix_operational_changes_effective_at');
            $table->index(['calendar_version_id'], 'ix_operational_changes_calendar_version_id');
            $table->index(['actor_id'], 'ix_operational_changes_actor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_changes');
    }
};
