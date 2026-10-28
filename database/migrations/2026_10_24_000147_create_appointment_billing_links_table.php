<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_billing_links', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('appointment_id', 36);
            $table->char('billing_account_id', 36);
            $table->char('created_by', 36);
            $table->string('reason', 500);
            $table->dateTime('created_at', 6);
            $table->unique(['appointment_id'], 'uq_appointment_billing_links_appointment_id');
            $table->index(['billing_account_id'], 'ix_appointment_billing_links_billing_account_id');
            $table->index(['created_by'], 'ix_appointment_billing_links_created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_billing_links');
    }
};
