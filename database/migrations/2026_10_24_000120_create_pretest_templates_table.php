<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pretest_templates', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('template_key', 80);
            $table->unsignedInteger('version');
            $table->json('questions');
            $table->dateTime('effective_at', 6);
            $table->char('created_by', 36);
            $table->dateTime('created_at', 6);
            $table->unique(['template_key', 'version'], 'uq_pretest_templates_template_key_version');
            $table->index(['created_by'], 'ix_pretest_templates_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pretest_templates');
    }
};
