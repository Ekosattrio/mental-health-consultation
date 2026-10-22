<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'preview_url' => app()->environment('local') && config('jiwasehat.legacy_preview_enabled')
                    ? route('legacy.preview') : null,
            ],
            // Hanya identitas sesi sendiri; tidak ada data pasien/uang/klinis global.
            'auth' => [
                'user' => $user ? $user->only(['id', 'name', 'email', 'role']) : null,
            ],
            'routes' => [
                'home' => route('home'),
                'login' => route('login'),
                'logout' => route('logout'),
                'dashboard' => route('dashboard'),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
