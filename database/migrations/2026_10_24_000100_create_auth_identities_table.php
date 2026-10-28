<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_identities', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('user_id', 36);
            $table->string('provider', 20);
            $table->string('subject', 255);
            $table->dateTime('linked_at', 6);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['provider', 'subject'], 'uq_auth_identities_provider_subject');
            $table->unique(['user_id', 'provider'], 'uq_auth_identities_user_id_provider');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_identities');
    }
};
