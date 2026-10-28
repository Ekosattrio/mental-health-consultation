<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_agreements', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('treatment_plan_id', 36);
            $table->char('first_billing_account_id', 36);
            $table->char('package_version_id', 36);
            $table->unsignedInteger('session_count')->default(4);
            $table->unsignedBigInteger('session_subtotal');
            $table->unsignedBigInteger('session_discount')->default(0);
            $table->unsignedBigInteger('session_amount');
            $table->unsignedInteger('duration_minutes');
            $table->dateTime('agreed_at', 6);
            $table->char('created_by', 36);
            $table->json('terms_snapshot')->nullable();
            $table->dateTime('created_at', 6);
            $table->unique(['treatment_plan_id'], 'uq_payment_agreements_treatment_plan_id');
            $table->unique(['first_billing_account_id'], 'uq_payment_agreements_first_billing_account_id');
            $table->index(['package_version_id'], 'ix_payment_agreements_package_version_id');
            $table->index(['created_by'], 'ix_payment_agreements_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_agreements');
    }
};
