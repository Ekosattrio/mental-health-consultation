<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')->name('logout');

Route::middleware(['auth', 'active'])->group(function (): void {
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
