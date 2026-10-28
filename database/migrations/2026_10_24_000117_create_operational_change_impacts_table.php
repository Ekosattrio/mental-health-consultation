<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_change_impacts', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('operational_change_id', 36);
            $table->char('appointment_id', 36);
            $table->string('resolution', 30)->default('PENDING');
            $table->dateTime('resolved_at', 6)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['operational_change_id', 'appointment_id'], 'uq_operational_change_impacts_operational_change__ecc26f12');
            $table->index(['appointment_id'], 'ix_operational_change_impacts_appointment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_change_impacts');
    }
};
