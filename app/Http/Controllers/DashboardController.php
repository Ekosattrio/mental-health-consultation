<?php

namespace App\Http\Controllers;

use App\Domain\WorkspaceData;
use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $intent = $request->query('package', $request->session()->pull('booking_intent'));
        $parameters = is_string($intent) && preg_match('/^[A-Z0-9_]{1,80}$/D', $intent) ? ['package' => $intent] : [];
        if (is_string($request->query('tab')) && preg_match('/^[A-Za-z]{1,30}$/D', $request->query('tab'))) $parameters['tab'] = $request->query('tab');

        return redirect()->route(match ($request->user()->role) {
            UserRole::Patient => 'patient.dashboard',
            UserRole::Admin => 'admin.dashboard',
            UserRole::Superadmin => 'superadmin.dashboard',
        }, $parameters);
    }

    public function show(Request $request): Response
    {
        return Inertia::render('Eko/Workspace', [
            'workspace' => app(WorkspaceData::class)->for($request->user(), $request->validate(['appointment_id' => 'sometimes|uuid', 'status' => 'sometimes|in:WAITING_PAYMENT,WAITING_VERIFICATION,CONFIRMED,CONFIRMED_AUTO_SLA,CHECKED_IN,IN_CONSULTATION,COMPLETED,NO_SHOW,CANCELLED,EXPIRED', 'page' => 'sometimes|integer|min:1', 'patient_id' => 'sometimes|uuid', 'date' => 'sometimes|date_format:Y-m-d', 'search' => 'sometimes|string|max:100'])),
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
