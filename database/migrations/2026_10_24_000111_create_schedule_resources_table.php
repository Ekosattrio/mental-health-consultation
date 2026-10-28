<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_resources', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('psychologist_id', 36);
            $table->date('local_date');
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['psychologist_id', 'local_date'], 'uq_schedule_resources_psychologist_id_local_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_resources');
    }
};
