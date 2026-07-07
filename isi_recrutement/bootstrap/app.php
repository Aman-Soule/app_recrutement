<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Pas de mode stateful Sanctum : l'API utilise exclusivement des tokens Bearer
        // (statefulApi() forcerait la vérification CSRF sur les requêtes venant de
        // localhost, ce qui casse le login du front Angular en Bearer token).

        // Redirection si NON connecté → login
        $middleware->redirectGuestsTo(fn () => route('login'));

        // Redirection si déjà connecté → selon rôle
        $middleware->redirectUsersTo(function () {
            return match(auth()->user()->role) {
                'recruiter' => route('recruteur.dashboard'),
                'candidate' => route('candidat.dashboard'),
                default     => '/',
            };
        });

        // Alias des middlewares
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*')
        );
    })
    ->create();
