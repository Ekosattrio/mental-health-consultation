<?php

use App\Domain\WorkspaceData;
use App\Http\Controllers\Auth\AccountController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ClinicalAdministrationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ManagementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicAssetController;
use App\Models\CmsContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');
Route::get('/informasi/{section}', function (string $section) {
    $content = CmsContent::where('section_key', $section)->where('status', 'PUBLISHED')->firstOrFail();

    return Inertia::render('PublicContent', ['content' => $content->only(['version', 'payload'])]);
})->whereIn('section', ['privacy', 'consent']);
Route::get('/media/{asset}', [PublicAssetController::class, 'show'])->where('asset', '[a-f0-9-]{36}\.(jpg|png|webp)');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
    Route::get('/register', [AccountController::class, 'registerForm'])->name('register');
    Route::post('/register', [AccountController::class, 'register'])->middleware('throttle:6,1');
    Route::get('/forgot-password', [AccountController::class, 'forgotForm'])->name('password.request');
    Route::post('/forgot-password', [AccountController::class, 'forgot'])->middleware('throttle:3,1')->name('password.email');
    Route::get('/reset-password/{token}', [AccountController::class, 'resetForm'])->name('password.reset');
    Route::post('/reset-password', [AccountController::class, 'reset'])->middleware('throttle:6,1')->name('password.update');
    Route::post('/auth/google/credential', [GoogleController::class, 'credential'])->middleware('throttle:10,1');
    Route::get('/auth/google/complete', [GoogleController::class, 'form']);
    Route::post('/auth/google/complete', [GoogleController::class, 'complete'])->middleware('throttle:6,1');
    Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->middleware('throttle:10,1')->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->middleware('throttle:10,1')->name('google.callback');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')->name('logout');

Route::middleware(['auth', 'active'])->group(function (): void {
    Route::get('/work/data', fn (Request $request) => response()->json(['data' => app(WorkspaceData::class)->for($request->user(), $request->validate(['appointment_id' => 'sometimes|uuid', 'status' => 'sometimes|in:WAITING_PAYMENT,WAITING_VERIFICATION,CONFIRMED,CONFIRMED_AUTO_SLA,CHECKED_IN,IN_CONSULTATION,COMPLETED,NO_SHOW,CANCELLED,EXPIRED', 'page' => 'sometimes|integer|min:1', 'patient_id' => 'sometimes|uuid', 'date' => 'sometimes|date_format:Y-m-d', 'search' => 'sometimes|string|max:100']))]));
    Route::get('/availability', [BookingController::class, 'slots'])->middleware('throttle:120,1');
    Route::get('/superadmin/whatsapp/status', [NotificationController::class, 'status'])->middleware('role:PSYCHOLOGIST');
    Route::get('/admin/cms/{cms}/preview', [ManagementController::class, 'preview'])->whereUuid('cms');
    Route::get('/files/{file}/download', [FileController::class, 'download'])->whereUuid('file');
    Route::get('/invoices/{invoice}/download', [FileController::class, 'invoice'])->whereUuid('invoice');
    Route::get('/receipts/{receipt}/download', [FileController::class, 'receipt'])->whereUuid('receipt');
    Route::get('/superadmin/finance', [FinanceController::class, 'show'])->middleware('role:PSYCHOLOGIST');
    Route::middleware('throttle:120,1')->group(function (): void {
        Route::post('/appointments/preview', [BookingController::class, 'preview']);
        Route::post('/appointments', [BookingController::class, 'store']);
        Route::post('/admin/appointments/custom', [BookingController::class, 'custom'])->middleware('role:ADMIN,PSYCHOLOGIST');
        Route::post('/patients', [ClinicalAdministrationController::class, 'patient']);
        Route::match(['post', 'patch'], '/patients/{patient}', [ClinicalAdministrationController::class, 'patient'])->whereUuid('patient');
        Route::post('/admin/patients/{patient}/link', [ClinicalAdministrationController::class, 'link'])->whereUuid('patient');
        Route::post('/pretests', [ClinicalAdministrationController::class, 'pretest']);
        Route::post('/consents', [ClinicalAdministrationController::class, 'consent']);
        Route::post('/consents/{consent}/withdraw', [ClinicalAdministrationController::class, 'withdraw'])->whereUuid('consent');
        Route::post('/superadmin/treatment-plans/{plan}/{action}', [ClinicalAdministrationController::class, 'planAction'])->whereUuid('plan')->whereIn('action', ['objective', 'complete', 'discontinue']);
        Route::post('/account', [ManagementController::class, 'account']);
        Route::post('/superadmin/whatsapp/pairing', [NotificationController::class, 'pairing'])->middleware('role:PSYCHOLOGIST')->middleware('throttle:2,1');
        Route::post('/appointments/{appointment}/reminder-contact', [NotificationController::class, 'contact'])->whereUuid('appointment');
        Route::post('/files', [FileController::class, 'store'])->middleware('throttle:20,1');
        Route::post('/appointments/{appointment}/payment-submissions', [BillingController::class, 'submit'])->whereUuid('appointment');
        Route::post('/admin/appointments/{appointment}/payments', [BillingController::class, 'record'])->whereUuid('appointment');
        Route::post('/payments/{payment}/{action}', [BillingController::class, 'payment'])->whereUuid('payment')->whereIn('action', ['verify', 'reject', 'corrections', 'proof']);
        Route::post('/admin/billing-accounts/{billing}/{action}', [BillingController::class, 'change'])->whereUuid('billing')->whereIn('action', ['charges', 'discounts']);
        Route::post('/admin/appointments/{appointment}/additional-time', [BillingController::class, 'time'])->whereUuid('appointment');
        Route::post('/admin/appointments/{appointment}/next', [BookingController::class, 'next'])->whereUuid('appointment');
        Route::post('/admin/appointments/{appointment}/{action}', [BookingController::class, 'lifecycle'])->whereUuid('appointment')->whereIn('action', ['check-in', 'start', 'complete', 'no-show', 'cancel']);
        Route::post('/appointments/{appointment}/reschedule-requests', [BookingController::class, 'reschedule'])->whereUuid('appointment');
        Route::post('/reschedule-requests/{reschedule}/{decision}', [BookingController::class, 'review'])->whereUuid('reschedule')->whereIn('decision', ['approve', 'reject', 'apply', 'reopen', 'selection', 'cancel']);
        Route::post('/admin/packages', [ManagementController::class, 'package']);
        Route::post('/admin/packages/{package}/active', [ManagementController::class, 'togglePackage'])->whereUuid('package');
        Route::post('/admin/calendar/preview', [ManagementController::class, 'calendarPreview']);
        Route::post('/admin/calendar/apply', [ManagementController::class, 'calendarApply']);
        Route::post('/admin/cms', [ManagementController::class, 'cms']);
        Route::post('/admin/cms/{cms}/publish', [ManagementController::class, 'publish'])->whereUuid('cms');
        Route::post('/admin/assets', [PublicAssetController::class, 'store'])->middleware('throttle:10,1');
        Route::post('/superadmin/settings', [ManagementController::class, 'settings']);
        Route::post('/superadmin/users', [ManagementController::class, 'user']);
        Route::post('/superadmin/users/{user}', [ManagementController::class, 'user'])->whereUuid('user');
        Route::post('/billing-accounts/{billing}/review', [ClinicalAdministrationController::class, 'review'])->whereUuid('billing');
        Route::post('/admin/reviews/{review}/moderate', [ClinicalAdministrationController::class, 'moderate'])->whereUuid('review');
        Route::post('/superadmin/assessment-cases/{case}/{action}', [ClinicalAdministrationController::class, 'caseAction'])->whereUuid('case')->whereIn('action', ['scope', 'close', 'reopen']);
        Route::post('/admin/assessment-cases/{case}/report', [ClinicalAdministrationController::class, 'report'])->whereUuid('case');
        Route::post('/tutorial-progress/{tutorial}', [ClinicalAdministrationController::class, 'tutorial'])->whereUuid('tutorial');
        Route::post('/admin/tutorials', [ClinicalAdministrationController::class, 'tutorialContent']);
        Route::post('/admin/appointments/{appointment}/tele-service-links', [NotificationController::class, 'meet'])->whereUuid('appointment');
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'read'])->whereUuid('notification');
        Route::post('/admin/notification-deliveries/{notification}/retry', [NotificationController::class, 'retry'])->whereUuid('notification');
        Route::post('/exports', [FinanceController::class, 'export'])->middleware('throttle:5,1');
        Route::post('/superadmin/expenses', [FinanceController::class, 'expense']);
        Route::post('/superadmin/expenses/{expense}/corrections', [FinanceController::class, 'expense'])->whereUuid('expense');
    });
    Route::get('/dashboard', [DashboardController::class, 'redirect'])->name('dashboard');
    Route::get('/pasien/dashboard', [DashboardController::class, 'show'])
        ->middleware('role:PATIENT')->name('patient.dashboard');
    Route::get('/admin/dashboard', [DashboardController::class, 'show'])
        ->middleware('role:ADMIN,PSYCHOLOGIST')->name('admin.dashboard');
    Route::get('/superadmin/dashboard', [DashboardController::class, 'show'])
        ->middleware('role:PSYCHOLOGIST')->name('superadmin.dashboard');
});

// Pratinjau mock tidak menjadi jalur operasional dan selalu 404 di production.
Route::get('/preview/eko', fn () => Inertia::render('LegacyPreview'))
    ->middleware('legacy-preview')->name('legacy.preview');
