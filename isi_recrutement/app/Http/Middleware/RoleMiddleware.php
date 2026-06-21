<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        // ============================================================
        // VÉRIFICATION 1 — L'utilisateur est-il connecté ?
        // ============================================================
        if (!Auth::check()) {
            // Routes web → redirection vers la page login
            return redirect()->route('login');

            // TODO (plus tard) : Pour l'API Angular, cette ligne remplacera
            // la redirection ci-dessus car Angular gère ses propres redirections :
            // return response()->json(['message' => 'Non authentifié.'], 401);
        }

        // ============================================================
        // VÉRIFICATION 2 — L'utilisateur a-t-il le bon rôle ?
        // ============================================================
        if (Auth::user()->role !== $role) {

            // Si c'est une requête API (Angular) → réponse JSON
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Accès non autorisé pour ce rôle.'
                ], 403);
            }

            // Si c'est une requête Web (Blade) → redirection avec message
            return redirect()->route('login')->withErrors([
                'email' => 'Vous n\'avez pas accès à cette section.'
            ]);

            // TODO (plus tard) : Quand on aura plusieurs rôles complexes
            // (ex: admin qui peut accéder aux pages recruteur),
            // remplacer la condition simple par :
            // $rolesAutorises = ['admin', $role];
            // if (!in_array(Auth::user()->role, $rolesAutorises)) { ... }
        }

        // ============================================================
        // VÉRIFICATION 3 — L'utilisateur a le bon rôle, on continue
        // ============================================================
        return $next($request);

        // TODO (plus tard) : Ajouter ici un log d'accès pour l'audit :
        // \Log::info('Accès autorisé', [
        //     'user_id' => Auth::id(),
        //     'role'    => Auth::user()->role,
        //     'url'     => $request->url(),
        //     'ip'      => $request->ip(),
        // ]);
    }
}

// ====================================================================
// NOTES POUR LA SUITE DU PROJET
// ====================================================================
//
// 1. MIDDLEWARE ADMIN (à créer plus tard) :
//    php artisan make:middleware AdminMiddleware
//    → Permettra à l'admin d'accéder à TOUTES les sections
//
// 2. MIDDLEWARE PERMISSION (à créer plus tard) :
//    php artisan make:middleware PermissionMiddleware
//    → Gestion fine des permissions (ex: recruteur qui peut voir les stats)
//    → Utiliser un package comme "spatie/laravel-permission"
//
// 3. THROTTLE SUR LES ROUTES SENSIBLES (à ajouter plus tard) :
//    Route::middleware(['auth', 'role:recruiter', 'throttle:60,1'])
//    → Limite les requêtes pour éviter les abus
//
// 4. LOGS D'ACCÈS (à activer en production) :
//    → Enregistrer chaque accès dans une table "access_logs"
//    → Utile pour l'audit de sécurité
//
// ====================================================================
