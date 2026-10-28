<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_profiles', function (Blueprint $table): void {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->uuid('id')->primary();
            $table->string('full_name', 150);
            $table->date('birth_date')->nullable();
            $table->string('birth_place', 150)->nullable();
            $table->string('gender', 30)->nullable();
            $table->string('phone', 25)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 150)->nullable();
            $table->string('occupation', 150)->nullable();
            $table->json('emergency_contact')->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 6);
            $table->dateTime('updated_at', 6);
            $table->unsignedInteger('row_version')->default(1);
            $table->index(['full_name'], 'ix_patient_profiles_full_name');
            $table->index(['phone'], 'ix_patient_profiles_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_profiles');
    }
};
