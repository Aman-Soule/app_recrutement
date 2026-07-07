<?php

namespace App\Http\Controllers;

use App\Models\RecruiterProfile;
use App\Traits\GereLesFichiers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RecruiterProfileController extends Controller
{
    use GereLesFichiers;

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

    /** Mettre à jour la photo de profil */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $profil = $request->user()->profilRecruteur;
        $this->supprimerAncienFichier($profil->avatar_url);

        $chemin = $request->file('avatar')->store('avatars', 'public');
        $profil->avatar_url = Storage::disk('public')->url($chemin);
        $profil->save();

        return response()->json([
            'message' => 'Photo de profil mise à jour',
            'profil'  => $profil->load('entreprise'),
        ]);
    }
}
