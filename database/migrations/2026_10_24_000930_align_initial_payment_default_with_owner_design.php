<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ide Desman §51/§459: minimum 50% harga final. Tidak mengubah konfigurasi yang telah disimpan.
        DB::statement("ALTER TABLE owner_settings ALTER COLUMN initial_payment_mode SET DEFAULT 'PERCENT'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE owner_settings ALTER COLUMN initial_payment_mode SET DEFAULT 'FIXED'");
    }
};
