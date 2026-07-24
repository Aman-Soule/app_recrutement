<?php

namespace App\Http\Controllers;

use App\Mail\LoginNotification;
use App\Models\User;
use App\Models\CandidateProfile;
use App\Models\RecruiterProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Inscription */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'sometimes|in:admin,recruiter,candidate',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'candidate',
        ]);

        // Créer automatiquement le profil selon le rôle
        if ($user->role === 'candidate') {
            CandidateProfile::create(['user_id' => $user->id]);
        } elseif ($user->role === 'recruiter') {
            RecruiterProfile::create(['user_id' => $user->id]);
        }

        // Créer le token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ], 201);
    }

    /** Connexion */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $user = Auth::user();

        // Supprimer les anciens tokens et créer un nouveau
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->envoyerEmailConnexion($user, $request);

        return response()->json([
            'message' => 'Connexion réussie',
            'user'    => $user,
            'token'   => $token,
            'role'    => $user->role,
        ]);
    }

    /** Récupérer l'utilisateur connecté avec son profil */
    public function user(Request $request)
    {
        $user = $request->user();

        // Charger le bon profil selon le rôle
        if ($user->estCandidat()) {
            $user->load('profilCandidat.competences');
        } elseif ($user->estRecruteur()) {
            $user->load('profilRecruteur.entreprise');
        }

        return response()->json($user);
    }

    /** Déconnexion */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    /** Modification des informations personnelles (nom, email) */
    public function updateAccount(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        return response()->json(['user' => $user->fresh()]);
    }

    /** Changement de mot de passe */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password'          => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }

    /** Notifie l'utilisateur par email d'une nouvelle connexion (ne bloque jamais le login) */
    private function envoyerEmailConnexion(User $user, Request $request): void
    {
        try {
            Mail::to($user->email)->send(new LoginNotification(
                $user,
                now()->format('d/m/Y à H:i'),
                $request->ip(),
            ));
        } catch (\Throwable $e) {
            Log::warning('Échec de l\'envoi de l\'email de connexion : ' . $e->getMessage());
        }
    }
}
