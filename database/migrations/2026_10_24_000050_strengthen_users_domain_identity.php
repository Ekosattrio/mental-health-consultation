<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            throw new RuntimeException('Schema domain ditargetkan untuk MySQL 8.0.16+.');
        }
        Schema::table('users', function (Blueprint $table): void {
            $table->string('email', 254)->nullable()->change();
            $table->unsignedTinyInteger('active_owner_guard')->nullable()->storedAs(
                "CASE WHEN role = 'PSYCHOLOGIST' AND status = 'ACTIVE' THEN 1 ELSE NULL END"
            );
            $table->unique('active_owner_guard', 'uq_users_single_active_owner');
        });
        DB::statement("ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN ('PATIENT','ADMIN','PSYCHOLOGIST'))");
        DB::statement("ALTER TABLE users ADD CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE','BLOCKED'))");
        DB::statement('ALTER TABLE users ADD CONSTRAINT ck_users_row_version CHECK (row_version > 0)');
        DB::statement("ALTER TABLE users ADD CONSTRAINT ck_users_staff_email CHECK (role = 'PATIENT' OR (email IS NOT NULL AND CHAR_LENGTH(TRIM(email)) > 0))");
    }

    public function down(): void
    {
        foreach (['ck_users_staff_email', 'ck_users_row_version', 'ck_users_status', 'ck_users_role'] as $name) {
            DB::statement("ALTER TABLE users DROP CHECK {$name}");
        }
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique('uq_users_single_active_owner');
            $table->dropColumn('active_owner_guard');
        });
        // Tetap nullable: rollback tidak boleh mengarang email bagi identitas offline.
    }
};
