<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auth_identities', function (Blueprint $table): void {
            $table->foreign('user_id', 'fk_auth_identities_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('owner_settings', function (Blueprint $table): void {
            $table->foreign('owner_user_id', 'fk_owner_settings_owner_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('patient_accesses', function (Blueprint $table): void {
            $table->foreign('account_user_id', 'fk_patient_accesses_account_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('patient_accesses', function (Blueprint $table): void {
            $table->foreign('patient_id', 'fk_patient_accesses_patient_id')->references('id')->on('patient_profiles')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('patient_accesses', function (Blueprint $table): void {
            $table->foreign('verified_by', 'fk_patient_accesses_verified_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('consultation_packages', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_consultation_packages_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('package_versions', function (Blueprint $table): void {
            $table->foreign('package_id', 'fk_package_versions_package_id')->references('id')->on('consultation_packages')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('package_versions', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_package_versions_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('calendar_versions', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_calendar_versions_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('weekly_schedule_limits', function (Blueprint $table): void {
            $table->foreign('calendar_version_id', 'fk_weekly_schedule_limits_calendar_version_id')->references('id')->on('calendar_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('weekly_schedules', function (Blueprint $table): void {
            $table->foreign('calendar_version_id', 'fk_weekly_schedules_calendar_version_id')->references('id')->on('calendar_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('schedule_overrides', function (Blueprint $table): void {
            $table->foreign('calendar_version_id', 'fk_schedule_overrides_calendar_version_id')->references('id')->on('calendar_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('schedule_override_intervals', function (Blueprint $table): void {
            $table->foreign('override_id', 'fk_schedule_override_intervals_override_id')->references('id')->on('schedule_overrides')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('schedule_resources', function (Blueprint $table): void {
            $table->foreign('psychologist_id', 'fk_schedule_resources_psychologist_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('operational_changes', function (Blueprint $table): void {
            $table->foreign('calendar_version_id', 'fk_operational_changes_calendar_version_id')->references('id')->on('calendar_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('operational_changes', function (Blueprint $table): void {
            $table->foreign('actor_id', 'fk_operational_changes_actor_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('assessment_cases', function (Blueprint $table): void {
            $table->foreign('patient_id', 'fk_assessment_cases_patient_id')->references('id')->on('patient_profiles')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('assessment_cases', function (Blueprint $table): void {
            $table->foreign('package_version_id', 'fk_assessment_cases_package_version_id')->references('id')->on('package_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('assessment_cases', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_assessment_cases_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('treatment_plans', function (Blueprint $table): void {
            $table->foreign('patient_id', 'fk_treatment_plans_patient_id')->references('id')->on('patient_profiles')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('treatment_plans', function (Blueprint $table): void {
            $table->foreign('package_id', 'fk_treatment_plans_package_id')->references('id')->on('consultation_packages')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('treatment_plans', function (Blueprint $table): void {
            $table->foreign('psychologist_id', 'fk_treatment_plans_psychologist_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('patient_id', 'fk_appointments_patient_id')->references('id')->on('patient_profiles')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('booked_by_user_id', 'fk_appointments_booked_by_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('psychologist_id', 'fk_appointments_psychologist_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('package_version_id', 'fk_appointments_package_version_id')->references('id')->on('package_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('assessment_case_id', 'fk_appointments_assessment_case_id')->references('id')->on('assessment_cases')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('treatment_plan_id', 'fk_appointments_treatment_plan_id')->references('id')->on('treatment_plans')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('responsible_user_id', 'fk_appointments_responsible_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('calendar_version_id', 'fk_appointments_calendar_version_id')->references('id')->on('calendar_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointments', function (Blueprint $table): void {
            $table->foreign('checked_in_by', 'fk_appointments_checked_in_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointment_events', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_appointment_events_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointment_events', function (Blueprint $table): void {
            $table->foreign('actor_id', 'fk_appointment_events_actor_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('operational_change_impacts', function (Blueprint $table): void {
            $table->foreign('operational_change_id', 'fk_operational_change_impacts_operational_change_id')->references('id')->on('operational_changes')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('operational_change_impacts', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_operational_change_impacts_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reschedule_requests', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_reschedule_requests_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reschedule_requests', function (Blueprint $table): void {
            $table->foreign('requested_by', 'fk_reschedule_requests_requested_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reschedule_requests', function (Blueprint $table): void {
            $table->foreign('approved_by', 'fk_reschedule_requests_approved_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reschedule_events', function (Blueprint $table): void {
            $table->foreign('request_id', 'fk_reschedule_events_request_id')->references('id')->on('reschedule_requests')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reschedule_events', function (Blueprint $table): void {
            $table->foreign('actor_id', 'fk_reschedule_events_actor_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('pretest_templates', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_pretest_templates_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('pretest_submissions', function (Blueprint $table): void {
            $table->foreign('patient_id', 'fk_pretest_submissions_patient_id')->references('id')->on('patient_profiles')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('pretest_submissions', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_pretest_submissions_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('pretest_submissions', function (Blueprint $table): void {
            $table->foreign('template_id', 'fk_pretest_submissions_template_id')->references('id')->on('pretest_templates')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('pretest_submissions', function (Blueprint $table): void {
            $table->foreign('author_user_id', 'fk_pretest_submissions_author_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('pretest_submissions', function (Blueprint $table): void {
            $table->foreign('supersedes_id', 'fk_pretest_submissions_supersedes_id')->references('id')->on('pretest_submissions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('consents', function (Blueprint $table): void {
            $table->foreign('patient_id', 'fk_consents_patient_id')->references('id')->on('patient_profiles')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('consents', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_consents_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('consents', function (Blueprint $table): void {
            $table->foreign('actor_user_id', 'fk_consents_actor_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('consents', function (Blueprint $table): void {
            $table->foreign('recorded_by_user_id', 'fk_consents_recorded_by_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('consents', function (Blueprint $table): void {
            $table->foreign('cms_content_id', 'fk_consents_cms_content_id')->references('id')->on('cms_contents')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('billing_accounts', function (Blueprint $table): void {
            $table->foreign('patient_id', 'fk_billing_accounts_patient_id')->references('id')->on('patient_profiles')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('billing_accounts', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_billing_accounts_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('billing_accounts', function (Blueprint $table): void {
            $table->foreign('assessment_case_id', 'fk_billing_accounts_assessment_case_id')->references('id')->on('assessment_cases')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('invoices', function (Blueprint $table): void {
            $table->foreign('billing_account_id', 'fk_invoices_billing_account_id')->references('id')->on('billing_accounts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('invoices', function (Blueprint $table): void {
            $table->foreign('parent_invoice_id', 'fk_invoices_parent_invoice_id')->references('id')->on('invoices')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('invoices', function (Blueprint $table): void {
            $table->foreign('issuer_id', 'fk_invoices_issuer_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('billing_line_items', function (Blueprint $table): void {
            $table->foreign('invoice_id', 'fk_billing_line_items_invoice_id')->references('id')->on('invoices')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('billing_line_items', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_billing_line_items_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('billing_line_items', function (Blueprint $table): void {
            $table->foreign('reference_line_id', 'fk_billing_line_items_reference_line_id')->references('id')->on('billing_line_items')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('billing_line_items', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_billing_line_items_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('additional_time_entries', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_additional_time_entries_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('additional_time_entries', function (Blueprint $table): void {
            $table->foreign('invoice_id', 'fk_additional_time_entries_invoice_id')->references('id')->on('invoices')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('additional_time_entries', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_additional_time_entries_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_transactions', function (Blueprint $table): void {
            $table->foreign('billing_account_id', 'fk_payment_transactions_billing_account_id')->references('id')->on('billing_accounts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_transactions', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_payment_transactions_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_transactions', function (Blueprint $table): void {
            $table->foreign('verified_by', 'fk_payment_transactions_verified_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_transactions', function (Blueprint $table): void {
            $table->foreign('submitted_by', 'fk_payment_transactions_submitted_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_transactions', function (Blueprint $table): void {
            $table->foreign('reversal_of_id', 'fk_payment_transactions_reversal_of_id')->references('id')->on('payment_transactions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_transactions', function (Blueprint $table): void {
            $table->foreign('payment_agreement_id', 'fk_payment_transactions_payment_agreement_id')->references('id')->on('payment_agreements')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_events', function (Blueprint $table): void {
            $table->foreign('payment_transaction_id', 'fk_payment_events_payment_transaction_id')->references('id')->on('payment_transactions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_events', function (Blueprint $table): void {
            $table->foreign('actor_id', 'fk_payment_events_actor_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('private_files', function (Blueprint $table): void {
            $table->foreign('uploaded_by', 'fk_private_files_uploaded_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_proofs', function (Blueprint $table): void {
            $table->foreign('payment_transaction_id', 'fk_payment_proofs_payment_transaction_id')->references('id')->on('payment_transactions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_proofs', function (Blueprint $table): void {
            $table->foreign('file_id', 'fk_payment_proofs_file_id')->references('id')->on('private_files')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('receipts', function (Blueprint $table): void {
            $table->foreign('payment_transaction_id', 'fk_receipts_payment_transaction_id')->references('id')->on('payment_transactions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('receipts', function (Blueprint $table): void {
            $table->foreign('correction_of_receipt_id', 'fk_receipts_correction_of_receipt_id')->references('id')->on('receipts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('report_deliveries', function (Blueprint $table): void {
            $table->foreign('billing_account_id', 'fk_report_deliveries_billing_account_id')->references('id')->on('billing_accounts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('report_deliveries', function (Blueprint $table): void {
            $table->foreign('assessment_case_id', 'fk_report_deliveries_assessment_case_id')->references('id')->on('assessment_cases')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('report_deliveries', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_report_deliveries_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('report_deliveries', function (Blueprint $table): void {
            $table->foreign('issued_by', 'fk_report_deliveries_issued_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reviews', function (Blueprint $table): void {
            $table->foreign('billing_account_id', 'fk_reviews_billing_account_id')->references('id')->on('billing_accounts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reviews', function (Blueprint $table): void {
            $table->foreign('author_user_id', 'fk_reviews_author_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('reviews', function (Blueprint $table): void {
            $table->foreign('moderated_by', 'fk_reviews_moderated_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('expenses', function (Blueprint $table): void {
            $table->foreign('reversal_of_id', 'fk_expenses_reversal_of_id')->references('id')->on('expenses')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('expenses', function (Blueprint $table): void {
            $table->foreign('attachment_file_id', 'fk_expenses_attachment_file_id')->references('id')->on('private_files')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('expenses', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_expenses_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('notifications', function (Blueprint $table): void {
            $table->foreign('outbox_id', 'fk_notifications_outbox_id')->references('id')->on('notification_outbox')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('notifications', function (Blueprint $table): void {
            $table->foreign('recipient_user_id', 'fk_notifications_recipient_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('notifications', function (Blueprint $table): void {
            $table->foreign('tele_service_link_id', 'fk_notifications_tele_service_link_id')->references('id')->on('tele_service_links')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('tele_service_links', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_tele_service_links_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('tele_service_links', function (Blueprint $table): void {
            $table->foreign('recipient_user_id', 'fk_tele_service_links_recipient_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('tele_service_links', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_tele_service_links_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('audit_logs', function (Blueprint $table): void {
            $table->foreign('actor_id', 'fk_audit_logs_actor_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('cms_contents', function (Blueprint $table): void {
            $table->foreign('updated_by', 'fk_cms_contents_updated_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('tutorial_progress', function (Blueprint $table): void {
            $table->foreign('user_id', 'fk_tutorial_progress_user_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('tutorial_progress', function (Blueprint $table): void {
            $table->foreign('tutorial_content_id', 'fk_tutorial_progress_tutorial_content_id')->references('id')->on('tutorial_contents')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('export_jobs', function (Blueprint $table): void {
            $table->foreign('requested_by', 'fk_export_jobs_requested_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('export_jobs', function (Blueprint $table): void {
            $table->foreign('file_id', 'fk_export_jobs_file_id')->references('id')->on('private_files')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('idempotency_requests', function (Blueprint $table): void {
            $table->foreign('actor_id', 'fk_idempotency_requests_actor_id')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_agreements', function (Blueprint $table): void {
            $table->foreign('treatment_plan_id', 'fk_payment_agreements_treatment_plan_id')->references('id')->on('treatment_plans')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_agreements', function (Blueprint $table): void {
            $table->foreign('first_billing_account_id', 'fk_payment_agreements_first_billing_account_id')->references('id')->on('billing_accounts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_agreements', function (Blueprint $table): void {
            $table->foreign('package_version_id', 'fk_payment_agreements_package_version_id')->references('id')->on('package_versions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_agreements', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_payment_agreements_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_allocations', function (Blueprint $table): void {
            $table->foreign('payment_transaction_id', 'fk_payment_allocations_payment_transaction_id')->references('id')->on('payment_transactions')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_allocations', function (Blueprint $table): void {
            $table->foreign('billing_account_id', 'fk_payment_allocations_billing_account_id')->references('id')->on('billing_accounts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_allocations', function (Blueprint $table): void {
            $table->foreign('reversal_of_id', 'fk_payment_allocations_reversal_of_id')->references('id')->on('payment_allocations')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('payment_allocations', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_payment_allocations_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointment_billing_links', function (Blueprint $table): void {
            $table->foreign('appointment_id', 'fk_appointment_billing_links_appointment_id')->references('id')->on('appointments')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointment_billing_links', function (Blueprint $table): void {
            $table->foreign('billing_account_id', 'fk_appointment_billing_links_billing_account_id')->references('id')->on('billing_accounts')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('appointment_billing_links', function (Blueprint $table): void {
            $table->foreign('created_by', 'fk_appointment_billing_links_created_by')->references('id')->on('users')->restrictOnUpdate()->restrictOnDelete();
        });
        Schema::table('consents', function (Blueprint $table): void {
            $table->foreign(['cms_content_id', 'document_key', 'document_version'], 'fk_consents_document_version')->references(['id', 'section_key', 'version'])->on('cms_contents')->restrictOnUpdate()->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('consents', fn (Blueprint $table) => $table->dropForeign('fk_consents_document_version'));
        Schema::table('appointment_billing_links', fn (Blueprint $table) => $table->dropForeign('fk_appointment_billing_links_created_by'));
        Schema::table('appointment_billing_links', fn (Blueprint $table) => $table->dropForeign('fk_appointment_billing_links_billing_account_id'));
        Schema::table('appointment_billing_links', fn (Blueprint $table) => $table->dropForeign('fk_appointment_billing_links_appointment_id'));
        Schema::table('payment_allocations', fn (Blueprint $table) => $table->dropForeign('fk_payment_allocations_created_by'));
        Schema::table('payment_allocations', fn (Blueprint $table) => $table->dropForeign('fk_payment_allocations_reversal_of_id'));
        Schema::table('payment_allocations', fn (Blueprint $table) => $table->dropForeign('fk_payment_allocations_billing_account_id'));
        Schema::table('payment_allocations', fn (Blueprint $table) => $table->dropForeign('fk_payment_allocations_payment_transaction_id'));
        Schema::table('payment_agreements', fn (Blueprint $table) => $table->dropForeign('fk_payment_agreements_created_by'));
        Schema::table('payment_agreements', fn (Blueprint $table) => $table->dropForeign('fk_payment_agreements_package_version_id'));
        Schema::table('payment_agreements', fn (Blueprint $table) => $table->dropForeign('fk_payment_agreements_first_billing_account_id'));
        Schema::table('payment_agreements', fn (Blueprint $table) => $table->dropForeign('fk_payment_agreements_treatment_plan_id'));
        Schema::table('idempotency_requests', fn (Blueprint $table) => $table->dropForeign('fk_idempotency_requests_actor_id'));
        Schema::table('export_jobs', fn (Blueprint $table) => $table->dropForeign('fk_export_jobs_file_id'));
        Schema::table('export_jobs', fn (Blueprint $table) => $table->dropForeign('fk_export_jobs_requested_by'));
        Schema::table('tutorial_progress', fn (Blueprint $table) => $table->dropForeign('fk_tutorial_progress_tutorial_content_id'));
        Schema::table('tutorial_progress', fn (Blueprint $table) => $table->dropForeign('fk_tutorial_progress_user_id'));
        Schema::table('cms_contents', fn (Blueprint $table) => $table->dropForeign('fk_cms_contents_updated_by'));
        Schema::table('audit_logs', fn (Blueprint $table) => $table->dropForeign('fk_audit_logs_actor_id'));
        Schema::table('tele_service_links', fn (Blueprint $table) => $table->dropForeign('fk_tele_service_links_created_by'));
        Schema::table('tele_service_links', fn (Blueprint $table) => $table->dropForeign('fk_tele_service_links_recipient_user_id'));
        Schema::table('tele_service_links', fn (Blueprint $table) => $table->dropForeign('fk_tele_service_links_appointment_id'));
        Schema::table('notifications', fn (Blueprint $table) => $table->dropForeign('fk_notifications_tele_service_link_id'));
        Schema::table('notifications', fn (Blueprint $table) => $table->dropForeign('fk_notifications_recipient_user_id'));
        Schema::table('notifications', fn (Blueprint $table) => $table->dropForeign('fk_notifications_outbox_id'));
        Schema::table('expenses', fn (Blueprint $table) => $table->dropForeign('fk_expenses_created_by'));
        Schema::table('expenses', fn (Blueprint $table) => $table->dropForeign('fk_expenses_attachment_file_id'));
        Schema::table('expenses', fn (Blueprint $table) => $table->dropForeign('fk_expenses_reversal_of_id'));
        Schema::table('reviews', fn (Blueprint $table) => $table->dropForeign('fk_reviews_moderated_by'));
        Schema::table('reviews', fn (Blueprint $table) => $table->dropForeign('fk_reviews_author_user_id'));
        Schema::table('reviews', fn (Blueprint $table) => $table->dropForeign('fk_reviews_billing_account_id'));
        Schema::table('report_deliveries', fn (Blueprint $table) => $table->dropForeign('fk_report_deliveries_issued_by'));
        Schema::table('report_deliveries', fn (Blueprint $table) => $table->dropForeign('fk_report_deliveries_appointment_id'));
        Schema::table('report_deliveries', fn (Blueprint $table) => $table->dropForeign('fk_report_deliveries_assessment_case_id'));
        Schema::table('report_deliveries', fn (Blueprint $table) => $table->dropForeign('fk_report_deliveries_billing_account_id'));
        Schema::table('receipts', fn (Blueprint $table) => $table->dropForeign('fk_receipts_correction_of_receipt_id'));
        Schema::table('receipts', fn (Blueprint $table) => $table->dropForeign('fk_receipts_payment_transaction_id'));
        Schema::table('payment_proofs', fn (Blueprint $table) => $table->dropForeign('fk_payment_proofs_file_id'));
        Schema::table('payment_proofs', fn (Blueprint $table) => $table->dropForeign('fk_payment_proofs_payment_transaction_id'));
        Schema::table('private_files', fn (Blueprint $table) => $table->dropForeign('fk_private_files_uploaded_by'));
        Schema::table('payment_events', fn (Blueprint $table) => $table->dropForeign('fk_payment_events_actor_id'));
        Schema::table('payment_events', fn (Blueprint $table) => $table->dropForeign('fk_payment_events_payment_transaction_id'));
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropForeign('fk_payment_transactions_payment_agreement_id'));
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropForeign('fk_payment_transactions_reversal_of_id'));
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropForeign('fk_payment_transactions_submitted_by'));
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropForeign('fk_payment_transactions_verified_by'));
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropForeign('fk_payment_transactions_appointment_id'));
        Schema::table('payment_transactions', fn (Blueprint $table) => $table->dropForeign('fk_payment_transactions_billing_account_id'));
        Schema::table('additional_time_entries', fn (Blueprint $table) => $table->dropForeign('fk_additional_time_entries_created_by'));
        Schema::table('additional_time_entries', fn (Blueprint $table) => $table->dropForeign('fk_additional_time_entries_invoice_id'));
        Schema::table('additional_time_entries', fn (Blueprint $table) => $table->dropForeign('fk_additional_time_entries_appointment_id'));
        Schema::table('billing_line_items', fn (Blueprint $table) => $table->dropForeign('fk_billing_line_items_created_by'));
        Schema::table('billing_line_items', fn (Blueprint $table) => $table->dropForeign('fk_billing_line_items_reference_line_id'));
        Schema::table('billing_line_items', fn (Blueprint $table) => $table->dropForeign('fk_billing_line_items_appointment_id'));
        Schema::table('billing_line_items', fn (Blueprint $table) => $table->dropForeign('fk_billing_line_items_invoice_id'));
        Schema::table('invoices', fn (Blueprint $table) => $table->dropForeign('fk_invoices_issuer_id'));
        Schema::table('invoices', fn (Blueprint $table) => $table->dropForeign('fk_invoices_parent_invoice_id'));
        Schema::table('invoices', fn (Blueprint $table) => $table->dropForeign('fk_invoices_billing_account_id'));
        Schema::table('billing_accounts', fn (Blueprint $table) => $table->dropForeign('fk_billing_accounts_assessment_case_id'));
        Schema::table('billing_accounts', fn (Blueprint $table) => $table->dropForeign('fk_billing_accounts_appointment_id'));
        Schema::table('billing_accounts', fn (Blueprint $table) => $table->dropForeign('fk_billing_accounts_patient_id'));
        Schema::table('consents', fn (Blueprint $table) => $table->dropForeign('fk_consents_cms_content_id'));
        Schema::table('consents', fn (Blueprint $table) => $table->dropForeign('fk_consents_recorded_by_user_id'));
        Schema::table('consents', fn (Blueprint $table) => $table->dropForeign('fk_consents_actor_user_id'));
        Schema::table('consents', fn (Blueprint $table) => $table->dropForeign('fk_consents_appointment_id'));
        Schema::table('consents', fn (Blueprint $table) => $table->dropForeign('fk_consents_patient_id'));
        Schema::table('pretest_submissions', fn (Blueprint $table) => $table->dropForeign('fk_pretest_submissions_supersedes_id'));
        Schema::table('pretest_submissions', fn (Blueprint $table) => $table->dropForeign('fk_pretest_submissions_author_user_id'));
        Schema::table('pretest_submissions', fn (Blueprint $table) => $table->dropForeign('fk_pretest_submissions_template_id'));
        Schema::table('pretest_submissions', fn (Blueprint $table) => $table->dropForeign('fk_pretest_submissions_appointment_id'));
        Schema::table('pretest_submissions', fn (Blueprint $table) => $table->dropForeign('fk_pretest_submissions_patient_id'));
        Schema::table('pretest_templates', fn (Blueprint $table) => $table->dropForeign('fk_pretest_templates_created_by'));
        Schema::table('reschedule_events', fn (Blueprint $table) => $table->dropForeign('fk_reschedule_events_actor_id'));
        Schema::table('reschedule_events', fn (Blueprint $table) => $table->dropForeign('fk_reschedule_events_request_id'));
        Schema::table('reschedule_requests', fn (Blueprint $table) => $table->dropForeign('fk_reschedule_requests_approved_by'));
        Schema::table('reschedule_requests', fn (Blueprint $table) => $table->dropForeign('fk_reschedule_requests_requested_by'));
        Schema::table('reschedule_requests', fn (Blueprint $table) => $table->dropForeign('fk_reschedule_requests_appointment_id'));
        Schema::table('operational_change_impacts', fn (Blueprint $table) => $table->dropForeign('fk_operational_change_impacts_appointment_id'));
        Schema::table('operational_change_impacts', fn (Blueprint $table) => $table->dropForeign('fk_operational_change_impacts_operational_change_id'));
        Schema::table('appointment_events', fn (Blueprint $table) => $table->dropForeign('fk_appointment_events_actor_id'));
        Schema::table('appointment_events', fn (Blueprint $table) => $table->dropForeign('fk_appointment_events_appointment_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_checked_in_by'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_calendar_version_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_responsible_user_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_treatment_plan_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_assessment_case_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_package_version_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_psychologist_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_booked_by_user_id'));
        Schema::table('appointments', fn (Blueprint $table) => $table->dropForeign('fk_appointments_patient_id'));
        Schema::table('treatment_plans', fn (Blueprint $table) => $table->dropForeign('fk_treatment_plans_psychologist_id'));
        Schema::table('treatment_plans', fn (Blueprint $table) => $table->dropForeign('fk_treatment_plans_package_id'));
        Schema::table('treatment_plans', fn (Blueprint $table) => $table->dropForeign('fk_treatment_plans_patient_id'));
        Schema::table('assessment_cases', fn (Blueprint $table) => $table->dropForeign('fk_assessment_cases_created_by'));
        Schema::table('assessment_cases', fn (Blueprint $table) => $table->dropForeign('fk_assessment_cases_package_version_id'));
        Schema::table('assessment_cases', fn (Blueprint $table) => $table->dropForeign('fk_assessment_cases_patient_id'));
        Schema::table('operational_changes', fn (Blueprint $table) => $table->dropForeign('fk_operational_changes_actor_id'));
        Schema::table('operational_changes', fn (Blueprint $table) => $table->dropForeign('fk_operational_changes_calendar_version_id'));
        Schema::table('schedule_resources', fn (Blueprint $table) => $table->dropForeign('fk_schedule_resources_psychologist_id'));
        Schema::table('schedule_override_intervals', fn (Blueprint $table) => $table->dropForeign('fk_schedule_override_intervals_override_id'));
        Schema::table('schedule_overrides', fn (Blueprint $table) => $table->dropForeign('fk_schedule_overrides_calendar_version_id'));
        Schema::table('weekly_schedules', fn (Blueprint $table) => $table->dropForeign('fk_weekly_schedules_calendar_version_id'));
        Schema::table('weekly_schedule_limits', fn (Blueprint $table) => $table->dropForeign('fk_weekly_schedule_limits_calendar_version_id'));
        Schema::table('calendar_versions', fn (Blueprint $table) => $table->dropForeign('fk_calendar_versions_created_by'));
        Schema::table('package_versions', fn (Blueprint $table) => $table->dropForeign('fk_package_versions_created_by'));
        Schema::table('package_versions', fn (Blueprint $table) => $table->dropForeign('fk_package_versions_package_id'));
        Schema::table('consultation_packages', fn (Blueprint $table) => $table->dropForeign('fk_consultation_packages_created_by'));
        Schema::table('patient_accesses', fn (Blueprint $table) => $table->dropForeign('fk_patient_accesses_verified_by'));
        Schema::table('patient_accesses', fn (Blueprint $table) => $table->dropForeign('fk_patient_accesses_patient_id'));
        Schema::table('patient_accesses', fn (Blueprint $table) => $table->dropForeign('fk_patient_accesses_account_user_id'));
        Schema::table('owner_settings', fn (Blueprint $table) => $table->dropForeign('fk_owner_settings_owner_user_id'));
        Schema::table('auth_identities', fn (Blueprint $table) => $table->dropForeign('fk_auth_identities_user_id'));
    }
};
