<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('additional_time_entries', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('appointment_id', 36);
            $table->unsignedInteger('attempt_number');
            $table->unsignedInteger('revision');
            $table->unsignedInteger('total_additional_minutes');
            $table->unsignedInteger('billed_blocks');
            $table->unsignedBigInteger('base_rate_snapshot');
            $table->string('rate_basis', 20);
            $table->unsignedSmallInteger('rate_basis_points')->default(2500);
            $table->unsignedBigInteger('calculated_total');
            $table->char('invoice_id', 36)->nullable();
            $table->char('created_by', 36);
            $table->string('reason', 500);
            $table->dateTime('created_at', 6);
            $table->unique(['appointment_id', 'attempt_number', 'revision'], 'uq_additional_time_entries_appointment_id_attempt_a6fd7046');
            $table->index(['invoice_id'], 'ix_additional_time_entries_invoice_id');
            $table->index(['created_by'], 'ix_additional_time_entries_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('additional_time_entries');
    }
};
