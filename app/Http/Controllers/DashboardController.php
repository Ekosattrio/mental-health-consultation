<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        return redirect()->route(match ($request->user()->role) {
            UserRole::Patient => 'patient.dashboard',
            UserRole::Admin => 'admin.dashboard',
            UserRole::Superadmin => 'superadmin.dashboard',
        });
    }

    public function show(Request $request): Response
    {
        return Inertia::render('Dashboard', [
            'dashboard' => [
                'title' => match ($request->user()->role) {
                    UserRole::Patient => 'Ruang Pasien',
                    UserRole::Admin => 'Administrasi Praktik',
                    UserRole::Superadmin => 'Pengelolaan Praktik',
                },
            ],
        ]);
    }
}
