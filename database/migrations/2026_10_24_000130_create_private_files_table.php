<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('private_files', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('storage_key', 255);
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size_bytes');
            $table->char('uploaded_by', 36);
            $table->dateTime('uploaded_at', 6);
            $table->dateTime('expires_at', 6);
            $table->dateTime('purged_at', 6)->nullable();
            $table->string('purpose', 30);
            $table->char('checksum_sha256', 64);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['storage_key'], 'uq_private_files_storage_key');
            $table->index(['expires_at', 'purged_at'], 'ix_private_files_expires_at_purged_at');
            $table->index(['uploaded_by'], 'ix_private_files_uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('private_files');
    }
};
