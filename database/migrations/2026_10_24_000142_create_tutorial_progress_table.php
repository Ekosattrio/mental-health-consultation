<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutorial_progress', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('user_id', 36);
            $table->char('tutorial_content_id', 36);
            $table->unsignedInteger('last_step')->default(0);
            $table->dateTime('completed_at', 6)->nullable();
            $table->dateTime('skipped_at', 6)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['user_id', 'tutorial_content_id'], 'uq_tutorial_progress_user_id_tutorial_content_id');
            $table->index(['tutorial_content_id'], 'ix_tutorial_progress_tutorial_content_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutorial_progress');
    }
};
