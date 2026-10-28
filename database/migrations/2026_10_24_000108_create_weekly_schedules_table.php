<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_schedules', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('calendar_version_id', 36);
            $table->unsignedTinyInteger('day_of_week');
            $table->time('start_time', 0);
            $table->time('end_time', 0);
            $table->dateTime('created_at', 6);
            $table->unique(['calendar_version_id', 'day_of_week', 'start_time'], 'uq_weekly_schedules_calendar_version_id_day_of_we_d82bec82');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_schedules');
    }
};
