<?php

namespace App\Http\Controllers;

use App\Models\CandidateProfile;
use App\Traits\GereLesFichiers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CandidateProfileController extends Controller
{
    use GereLesFichiers;

    /** Recruteur : voir les profils candidats ayant postulé à l'une de ses offres */
    public function pourRecruteur(Request $request)
    {
        $recruteur = $request->user()->profilRecruteur;

        $profils = CandidateProfile::whereHas('candidatures.offre', function ($q) use ($recruteur) {
                $q->where('recruiter_profile_id', $recruteur->id);
            })
            ->with('utilisateur', 'competences')
            ->when($request->recherche, function ($q) use ($request) {
                $q->whereHas('utilisateur', function ($uq) use ($request) {
                    $uq->where('name', 'like', "%{$request->recherche}%");
                });
            })
            ->distinct()
            ->paginate(10);

        return response()->json($profils);
    }

    /** Voir son propre profil candidat */
    public function show(Request $request)
    {
        $profil = $request->user()
            ->profilCandidat()
            ->with('competences')
            ->firstOrFail();

        return response()->json($profil);
    }

    /** Mettre à jour son profil candidat */
    public function update(Request $request)
    {
        $request->validate([
            'titre'                  => 'nullable|string|max:255',
            'biographie'             => 'nullable|string',
            'localisation'           => 'nullable|string',
            'portfolio_url'          => 'nullable|url',
            'linkedin_url'           => 'nullable|url',
            'annees_experience'      => 'nullable|integer|min:0',
            'disponibilite'          => 'nullable|in:disponible,a_lecoute,non_disponible',
            'salaire_min_souhaite'   => 'nullable|string',
            'salaire_max_souhaite'   => 'nullable|string',
            'type_contrat_souhaite'  => 'nullable|in:temps_plein,temps_partiel,freelance,stage',
            'type_lieu_souhaite'     => 'nullable|in:teletravail,hybride,presentiel',
        ]);

        $profil = $request->user()->profilCandidat;
        $profil->update($request->all());

        // Recalculer la force du profil
        $profil->force_profil = $this->calculerForceProfil($profil);
        $profil->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'profil'  => $profil,
        ]);
    }

    /** Ajouter ou mettre à jour les compétences du candidat */
    public function syncCompetences(Request $request)
    {
        $request->validate([
            'competences'                    => 'required|array',
            'competences.*.skill_id'         => 'required|exists:skills,id',
            'competences.*.niveau'           => 'required|in:debutant,intermediaire,avance,expert',
        ]);

        $profil = $request->user()->profilCandidat;

        // Synchroniser les compétences avec les données pivot
        $competencesFormatees = [];
        foreach ($request->competences as $competence) {
            $competencesFormatees[$competence['skill_id']] = [
                'niveau' => $competence['niveau'],
            ];
        }

        $profil->competences()->sync($competencesFormatees);

        // Recalculer la force du profil
        $profil->force_profil = $this->calculerForceProfil($profil->fresh());
        $profil->save();

        return response()->json([
            'message'     => 'Compétences mises à jour',
            'competences' => $profil->competences,
        ]);
    }

    /** Mettre à jour la photo de profil */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $profil = $request->user()->profilCandidat;
        $this->supprimerAncienFichier($profil->avatar_url);

        $chemin = $request->file('avatar')->store('avatars', 'public');
        $profil->avatar_url = Storage::disk('public')->url($chemin);
        $profil->save();

        return response()->json([
            'message' => 'Photo de profil mise à jour',
            'profil'  => $profil,
        ]);
    }

    /** Mettre à jour le CV */
    public function uploadCv(Request $request)
    {
        $request->validate([
            'cv' => 'required|mimes:pdf,doc,docx|max:5120',
        ]);

        $profil = $request->user()->profilCandidat;
        $this->supprimerAncienFichier($profil->cv_url);

        $chemin = $request->file('cv')->store('cvs', 'public');
        $profil->cv_url = Storage::disk('public')->url($chemin);
        $profil->force_profil = $this->calculerForceProfil($profil->fresh());
        $profil->save();

        return response()->json([
            'message' => 'CV mis à jour',
            'profil'  => $profil,
        ]);
    }

    /** Calcul de la force du profil (0-100) */
    private function calculerForceProfil(CandidateProfile $profil): int
    {
        $score = 0;

        if ($profil->titre)             $score += 15;
        if ($profil->biographie)        $score += 15;
        if ($profil->localisation)      $score += 10;
        if ($profil->cv_url)            $score += 20;
        if ($profil->linkedin_url)      $score += 10;
        if ($profil->portfolio_url)     $score += 10;
        if ($profil->competences()->count() >= 3) $score += 20;

        return min($score, 100);
    }
}
