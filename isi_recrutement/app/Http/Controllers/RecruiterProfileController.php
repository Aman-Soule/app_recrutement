<?php

namespace App\Http\Controllers;

use App\Models\RecruiterProfile;
use Illuminate\Http\Request;

class RecruiterProfileController extends Controller
{
    /** Voir son propre profil recruteur */
    public function show(Request $request)
    {
        $profil = $request->user()
            ->profilRecruteur()
            ->with('entreprise')
            ->firstOrFail();

        return response()->json($profil);
    }

    /** Mettre à jour son profil recruteur */
    public function update(Request $request)
    {
        $request->validate([
            'titre'      => 'nullable|string|max:255',
            'telephone'  => 'nullable|string|max:20',
            'company_id' => 'nullable|exists:companies,id',
        ]);

        $profil = $request->user()->profilRecruteur;
        $profil->update($request->all());

        return response()->json([
            'message' => 'Profil recruteur mis à jour',
            'profil'  => $profil->load('entreprise'),
        ]);
    }
}
