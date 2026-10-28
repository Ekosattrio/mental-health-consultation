<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('treatment_plans', fn (Blueprint $table) => $table->dateTime('administrative_closed_at', 6)->nullable());
        DB::statement("UPDATE treatment_plans SET administrative_closed_at=COALESCE(completed_at,discontinued_at,updated_at) WHERE status IN ('COMPLETED','DISCONTINUED')");
        Schema::table('treatment_plans', function (Blueprint $table): void {
            $table->dropUnique('uq_treatment_plans_active_plan_guard');
            $table->dropColumn('active_plan_guard');
        });
        Schema::table('treatment_plans', function (Blueprint $table): void {
            $table->string('active_plan_guard', 73)->nullable()->storedAs("CASE WHEN status='ACTIVE' OR (status='AWAITING_SETTLEMENT' AND administrative_closed_at IS NULL) THEN CONCAT(patient_id,':',package_id) ELSE NULL END");
            $table->unique('active_plan_guard', 'uq_treatment_plans_active_plan_guard');
        });
    }

    public function down(): void
    {
        if (DB::table('treatment_plans')->select('patient_id', 'package_id')->whereIn('status', ['ACTIVE', 'AWAITING_SETTLEMENT'])->groupBy('patient_id', 'package_id')->havingRaw('COUNT(*)>1')->get()->isNotEmpty()) {
            throw new RuntimeException('Rollback guard lama tidak dapat merepresentasikan koreksi historis bersamaan dengan plan baru. Selesaikan saldo historis dahulu; tidak ada histori yang dihapus otomatis.');
        }
        Schema::table('treatment_plans', function (Blueprint $table): void {
            $table->dropUnique('uq_treatment_plans_active_plan_guard');
            $table->dropColumn('active_plan_guard');
        });
        Schema::table('treatment_plans', function (Blueprint $table): void {
            $table->string('active_plan_guard', 73)->nullable()->storedAs("CASE WHEN status IN ('ACTIVE','AWAITING_SETTLEMENT') THEN CONCAT(patient_id,':',package_id) ELSE NULL END");
            $table->unique('active_plan_guard', 'uq_treatment_plans_active_plan_guard');
            $table->dropColumn('administrative_closed_at');
        });
    }
};
