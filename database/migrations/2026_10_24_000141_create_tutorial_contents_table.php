<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutorial_contents', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('content_key', 80);
            $table->string('role', 40);
            $table->unsignedInteger('version');
            $table->string('title', 180);
            $table->json('steps');
            $table->string('video_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['content_key', 'role', 'version'], 'uq_tutorial_contents_content_key_role_version');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutorial_contents');
    }
};
