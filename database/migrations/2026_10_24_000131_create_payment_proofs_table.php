<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_proofs', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('payment_transaction_id', 36);
            $table->char('file_id', 36);
            $table->unsignedInteger('version');
            $table->dateTime('received_at', 6);
            $table->string('decision', 20)->default('PENDING');
            $table->string('decision_reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['payment_transaction_id', 'version'], 'uq_payment_proofs_payment_transaction_id_version');
            $table->unique(['file_id'], 'uq_payment_proofs_file_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_proofs');
    }
};
