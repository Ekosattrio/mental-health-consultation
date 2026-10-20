<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLegacyPreview
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(app()->environment('local') && config('jiwasehat.legacy_preview_enabled'), 404);

        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store, private');

        return $response;
    }
}
