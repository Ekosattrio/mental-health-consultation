<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->status === UserStatus::Active && ! $request->session()->has('auth_version') && Auth::guard('web')->viaRemember()) {
            $request->session()->regenerate();
            $request->session()->put('auth_version', $request->user()->auth_version);
        }
        if ($request->user()?->status !== UserStatus::Active || (int) $request->session()->get('auth_version', 0) !== (int) $request->user()?->auth_version) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Sesi berakhir. Silakan masuk kembali.'], 401);
            }

            return redirect()->route('login')->withErrors(['email' => 'Sesi tidak dapat digunakan. Silakan masuk kembali.']);
        }

        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store, private');
        $response->headers->set('X-CSRF-Token', $request->session()->token());

        return $response;
    }
}
