<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_override_intervals', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('override_id', 36);
            $table->time('start_time', 0);
            $table->time('end_time', 0);
            $table->dateTime('created_at', 6);
            $table->unique(['override_id', 'start_time'], 'uq_schedule_override_intervals_override_id_start_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_override_intervals');
    }
};
