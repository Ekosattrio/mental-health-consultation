<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_contents', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('section_key', 80);
            $table->unsignedInteger('version');
            $table->json('payload');
            $table->string('status', 20)->default('DRAFT');
            $table->dateTime('published_at', 6)->nullable();
            $table->string('published_guard', 80)->nullable()->storedAs('CASE WHEN status = \'PUBLISHED\' THEN section_key ELSE NULL END');
            $table->char('updated_by', 36);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['section_key', 'version'], 'uq_cms_contents_section_key_version');
            $table->unique(['published_guard'], 'uq_cms_contents_published_guard');
            $table->index(['section_key', 'status'], 'ix_cms_contents_section_key_status');
            $table->index(['updated_by'], 'ix_cms_contents_updated_by');
            $table->unique(['id', 'section_key', 'version'], 'uq_cms_identity_version');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_contents');
    }
};
