<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_overrides', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('calendar_version_id', 36);
            $table->date('local_date');
            $table->string('mode', 10);
            $table->unsignedInteger('daily_limit');
            $table->string('reason', 500);
            $table->dateTime('created_at', 6);
            $table->unique(['calendar_version_id', 'local_date'], 'uq_schedule_overrides_calendar_version_id_local_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_overrides');
    }
};
