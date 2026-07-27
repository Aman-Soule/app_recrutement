<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /** Lister tous les utilisateurs, tous rôles confondus */
    public function index(Request $request)
    {
        $utilisateurs = User::when($request->role, function ($q) use ($request) {
                $q->where('role', $request->role);
            })
            ->when($request->recherche, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->recherche}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json($utilisateurs);
    }

    /** Voir le détail d'un utilisateur avec son profil */
    public function show(User $user)
    {
        if ($user->estCandidat()) {
            $user->load('profilCandidat.competences');
        } elseif ($user->estRecruteur()) {
            $user->load('profilRecruteur.entreprise');
        }

        return response()->json($user);
    }

    /** Modifier les informations d'un utilisateur (nom, email) */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only('name', 'email'));

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user'    => $user->fresh(),
        ]);
    }

    /** Activer ou désactiver un compte utilisateur */
    public function changerStatut(Request $request, User $user)
    {
        $request->validate([
            'actif' => 'required|boolean',
        ]);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier le statut de votre propre compte.',
            ], 422);
        }

        $user->actif = $request->boolean('actif');
        $user->save();

        if (!$user->actif) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->actif ? 'Compte activé' : 'Compte désactivé',
            'user'    => $user->fresh(),
        ]);
    }

    /** Supprimer définitivement un compte utilisateur */
    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
