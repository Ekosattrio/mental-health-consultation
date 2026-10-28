<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('owner_settings', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->unsignedTinyInteger('singleton_key')->default(1);
            $table->char('owner_user_id', 36);
            $table->json('practice_identity');
            $table->string('timezone', 64)->default('Asia/Jakarta');
            $table->unsignedInteger('grace_minutes')->default(15);
            $table->unsignedInteger('selection_window_hours')->default(24);
            $table->unsignedInteger('proof_correction_hours')->default(24);
            $table->string('wa_owner_phone', 25)->nullable();
            $table->unsignedInteger('online_lead_working_minutes')->default(180);
            $table->unsignedInteger('reminder_lead_minutes')->default(120);
            $table->unsignedInteger('payment_hold_hours')->default(24);
            $table->string('initial_payment_mode', 20)->default('FIXED');
            $table->unsignedBigInteger('initial_payment_fixed_amount')->default(100000);
            $table->unsignedSmallInteger('initial_payment_basis_points')->default(5000);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['singleton_key'], 'uq_owner_settings_singleton_key');
            $table->unique(['owner_user_id'], 'uq_owner_settings_owner_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owner_settings');
    }
};
