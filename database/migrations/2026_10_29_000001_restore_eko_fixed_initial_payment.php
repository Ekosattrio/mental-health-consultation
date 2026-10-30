<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE owner_settings ALTER COLUMN initial_payment_mode SET DEFAULT 'FIXED'");
        // Hanya kebijakan booking baru; snapshot tagihan dan transaksi lama tetap utuh.
        DB::table('owner_settings')->update(['initial_payment_mode' => 'FIXED', 'initial_payment_fixed_amount' => 100000, 'row_version' => DB::raw('row_version + 1')]);
        Schema::table('package_versions', fn (Blueprint $table) => $table->json('presentation')->nullable());
    }

    public function down(): void
    {
        Schema::table('package_versions', fn (Blueprint $table) => $table->dropColumn('presentation'));
        // Tidak mengembalikan kebijakan DP atau mengubah snapshot keuangan.
    }
};
