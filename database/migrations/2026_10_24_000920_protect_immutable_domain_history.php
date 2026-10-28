<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const APPEND_ONLY = [
        'package_versions', 'calendar_versions', 'weekly_schedule_limits', 'weekly_schedules',
        'schedule_overrides', 'schedule_override_intervals', 'operational_changes',
        'appointment_events', 'reschedule_events', 'pretest_templates', 'invoices',
        'billing_line_items', 'additional_time_entries', 'payment_events', 'receipts',
        'expenses', 'tele_service_links', 'audit_logs', 'payment_agreements',
        'payment_allocations', 'appointment_billing_links',
    ];

    public function up(): void
    {
        foreach (self::APPEND_ONLY as $table) {
            foreach (['UPDATE', 'DELETE'] as $operation) {
                $name = 'tr_history_'.strtolower($operation).'_'.$table;
                DB::unprepared("CREATE TRIGGER `{$name}` BEFORE {$operation} ON `{$table}` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Riwayat immutable: gunakan record koreksi baru'");
            }
        }
        DB::unprepared("CREATE TRIGGER tr_payment_verified_update BEFORE UPDATE ON payment_transactions FOR EACH ROW BEGIN IF OLD.status = 'VERIFIED' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Penerimaan terverifikasi immutable: gunakan reversal'; END IF; END");
        DB::unprepared("CREATE TRIGGER tr_payment_delete BEFORE DELETE ON payment_transactions FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Riwayat pembayaran tidak boleh dihapus'");
        DB::unprepared(<<<'SQL'
CREATE TRIGGER tr_pretest_submitted_update BEFORE UPDATE ON pretest_submissions FOR EACH ROW
BEGIN
    IF OLD.status = 'SUBMITTED' AND NOT (
        OLD.appointment_id IS NULL AND NEW.appointment_id IS NOT NULL
        AND NEW.status = OLD.status AND NEW.patient_id = OLD.patient_id
        AND NEW.template_id = OLD.template_id AND NEW.author_user_id = OLD.author_user_id
        AND BINARY NEW.answers = BINARY OLD.answers
        AND NEW.submitted_at <=> OLD.submitted_at AND NEW.supersedes_id <=> OLD.supersedes_id
        AND NEW.id = OLD.id AND NEW.created_at = OLD.created_at
        AND NEW.row_version = OLD.row_version + 1
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Profiling terkirim immutable: buat submission baru';
    END IF;
END
SQL);
        DB::unprepared("CREATE TRIGGER tr_pretest_delete BEFORE DELETE ON pretest_submissions FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Riwayat profiling tidak boleh dihapus'");
    }

    public function down(): void
    {
        foreach (['tr_pretest_delete', 'tr_pretest_submitted_update', 'tr_payment_delete', 'tr_payment_verified_update'] as $name) {
            DB::unprepared("DROP TRIGGER IF EXISTS `{$name}`");
        }
        foreach (array_reverse(self::APPEND_ONLY) as $table) {
            foreach (['delete', 'update'] as $operation) {
                DB::unprepared("DROP TRIGGER IF EXISTS `tr_history_{$operation}_{$table}`");
            }
        }
    }
};
