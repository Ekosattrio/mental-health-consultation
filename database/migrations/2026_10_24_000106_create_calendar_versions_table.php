<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_versions', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->unsignedInteger('version');
            $table->dateTime('effective_at', 6);
            $table->char('created_by', 36);
            $table->string('reason', 500);
            $table->dateTime('created_at', 6);
            $table->unique(['version'], 'uq_calendar_versions_version');
            $table->index(['created_by'], 'ix_calendar_versions_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_versions');
    }
};
