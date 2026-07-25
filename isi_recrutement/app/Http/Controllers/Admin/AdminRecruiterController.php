<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\RecruiterAccountCreated;
use App\Models\Company;
use App\Models\RecruiterProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AdminRecruiterController extends Controller
{
    /** Lister les recruteurs, filtrable par entreprise */
    public function index(Request $request)
    {
        $recruteurs = User::where('role', 'recruiter')
            ->with('profilRecruteur.entreprise')
            ->when($request->company_id, function ($q) use ($request) {
                $q->whereHas('profilRecruteur', function ($q2) use ($request) {
                    $q2->where('company_id', $request->company_id);
                });
            })
            ->when($request->recherche, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->recherche}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json($recruteurs);
    }

    /**
     * Créer un compte recruteur : génère un mot de passe temporaire, l'envoie par
     * e-mail au recruteur, et le renvoie une seule fois dans la réponse pour l'admin.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|string|email|max:255|unique:users',
            'company_id'  => 'nullable|exists:companies,id',
            'company_nom' => 'required_without:company_id|string|max:255',
            'titre'       => 'nullable|string|max:255',
            'telephone'   => 'nullable|string|max:20',
        ]);

        $companyId = $request->company_id;
        if (!$companyId) {
            $companyId = Company::create(['nom' => $request->company_nom])->id;
        }

        $tempPassword = Str::password(12);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($tempPassword),
            'role'     => 'recruiter',
        ]);

        $profil = RecruiterProfile::create([
            'user_id'    => $user->id,
            'company_id' => $companyId,
            'titre'      => $request->titre,
            'telephone'  => $request->telephone,
        ]);

        try {
            Mail::to($user->email)->send(new RecruiterAccountCreated($user, $tempPassword));
        } catch (\Throwable $e) {
            Log::warning('Échec de l\'envoi de l\'email de création de compte recruteur : ' . $e->getMessage());
        }

        return response()->json([
            'message'       => 'Compte recruteur créé avec succès',
            'user'          => $user,
            'profil'        => $profil->load('entreprise'),
            'temp_password' => $tempPassword,
        ], 201);
    }

    /** Voir le détail d'un recruteur */
    public function show(User $user)
    {
        abort_unless($user->role === 'recruiter', 404);

        $user->load('profilRecruteur.entreprise');

        return response()->json($user);
    }

    /** Mettre à jour un recruteur (infos utilisateur + profil) */
    public function update(Request $request, User $user)
    {
        abort_unless($user->role === 'recruiter', 404);

        $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'company_id' => 'nullable|exists:companies,id',
            'titre'      => 'nullable|string|max:255',
            'telephone'  => 'nullable|string|max:20',
        ]);

        $user->update($request->only('name', 'email'));

        $profil = $user->profilRecruteur;
        $profil->update($request->only('company_id', 'titre', 'telephone'));

        return response()->json([
            'message' => 'Recruteur mis à jour',
            'user'    => $user->fresh(),
            'profil'  => $profil->fresh('entreprise'),
        ]);
    }
}
