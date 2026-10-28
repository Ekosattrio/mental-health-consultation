<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_packages', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('service_code', 80);
            $table->string('category', 30);
            $table->boolean('is_active')->default(true);
            $table->char('created_by', 36);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['service_code'], 'uq_consultation_packages_service_code');
            $table->index(['category', 'is_active'], 'ix_consultation_packages_category_is_active');
            $table->index(['created_by'], 'ix_consultation_packages_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_packages');
    }
};
