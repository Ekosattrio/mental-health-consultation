<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_sequences', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('document_kind', 20);
            $table->date('local_date');
            $table->unsignedBigInteger('next_value')->default(1);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['document_kind', 'local_date'], 'uq_document_sequences_document_kind_local_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_sequences');
    }
};
