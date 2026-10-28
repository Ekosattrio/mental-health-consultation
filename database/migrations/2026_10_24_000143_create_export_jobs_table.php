<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('export_jobs', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('requested_by', 36);
            $table->string('kind', 30);
            $table->json('filters');
            $table->dateTime('as_of', 6);
            $table->json('dataset_snapshot');
            $table->string('status', 20)->default('QUEUED');
            $table->char('file_id', 36)->nullable();
            $table->dateTime('expires_at', 6)->nullable();
            $table->string('error', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->index(['requested_by', 'created_at'], 'ix_export_jobs_requested_by_created_at');
            $table->index(['file_id'], 'ix_export_jobs_file_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('export_jobs');
    }
};
