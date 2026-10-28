<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->char('billing_account_id', 36);
            $table->char('author_user_id', 36);
            $table->unsignedTinyInteger('rating');
            $table->string('comment', 2000)->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('status', 30)->default('PENDING_MODERATION');
            $table->unsignedInteger('version')->default(1);
            $table->char('moderated_by', 36)->nullable();
            $table->dateTime('moderated_at', 6)->nullable();
            $table->string('moderation_reason', 500)->nullable();
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->unique(['billing_account_id'], 'uq_reviews_billing_account_id');
            $table->index(['status', 'created_at'], 'ix_reviews_status_created_at');
            $table->index(['author_user_id'], 'ix_reviews_author_user_id');
            $table->index(['moderated_by'], 'ix_reviews_moderated_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
