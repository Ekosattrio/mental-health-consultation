<?php

use App\Http\Middleware\EnsureActiveUser;
use App\Http\Middleware\EnsureLegacyPreview;
use App\Http\Middleware\EnsureUserRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [\App\Http\Middleware\NormalizePracticeDates::class, HandleInertiaRequests::class]);
        $middleware->alias([
            'active' => EnsureActiveUser::class,
            'role' => EnsureUserRole::class,
            'legacy-preview' => EnsureLegacyPreview::class,
        ]);
        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo(fn () => route('dashboard'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function(\App\Exceptions\StaleDomainRecord $error, Request $request){
            return $request->expectsJson()?response()->json(['message'=>'Data berubah. Muat ulang sebelum menyimpan.','errors'=>['action'=>['Data berubah. Muat ulang sebelum menyimpan.']]],409):back()->withErrors(['action'=>'Data berubah. Muat ulang sebelum menyimpan.']);
        });
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
