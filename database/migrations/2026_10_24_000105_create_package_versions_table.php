<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_versions', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('package_id', 36);
            $table->unsignedInteger('version');
            $table->string('name', 180);
            $table->text('description');
            $table->string('variant', 40)->nullable();
            $table->string('delivery_mode', 30)->default('OFFLINE');
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->unsignedInteger('duration_min_minutes')->nullable();
            $table->unsignedInteger('duration_max_minutes')->nullable();
            $table->unsignedBigInteger('normal_price');
            $table->unsignedBigInteger('promo_price')->nullable();
            $table->dateTime('promo_starts_at', 6)->nullable();
            $table->dateTime('promo_ends_at', 6)->nullable();
            $table->string('additional_time_price_basis', 20)->nullable();
            $table->string('billing_mode', 30);
            $table->unsignedInteger('minimum_sessions')->default(1);
            $table->boolean('includes_result_report')->default(false);
            $table->boolean('requires_evaluation')->default(false);
            $table->json('benefits');
            $table->boolean('is_bookable')->default(false);
            $table->dateTime('effective_at', 6);
            $table->char('created_by', 36);
            $table->dateTime('created_at', 6);
            $table->unique(['package_id', 'version'], 'uq_package_versions_package_id_version');
            $table->unique(['package_id', 'effective_at'], 'uq_package_versions_package_id_effective_at');
            $table->index(['effective_at'], 'ix_package_versions_effective_at');
            $table->index(['created_by'], 'ix_package_versions_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_versions');
    }
};
