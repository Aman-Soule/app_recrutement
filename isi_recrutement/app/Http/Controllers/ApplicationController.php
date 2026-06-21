<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\JobOffer;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    /** Candidat : postuler à une offre */
    public function store(Request $request, JobOffer $jobOffer)
    {
        $request->validate([
            'lettre_motivation' => 'nullable|string',
            'cv_url'            => 'nullable|string',
        ]);

        $profil = $request->user()->profilCandidat;

        // Vérifier si déjà postulé
        $dejaPostule = Application::where('candidate_profile_id', $profil->id)
            ->where('job_offer_id', $jobOffer->id)
            ->exists();

        if ($dejaPostule) {
            return response()->json(['message' => 'Vous avez déjà postulé à cette offre'], 409);
        }

        $candidature = Application::create([
            'candidate_profile_id' => $profil->id,
            'job_offer_id'         => $jobOffer->id,
            'lettre_motivation'    => $request->lettre_motivation,
            'cv_url'               => $request->cv_url ?? $profil->cv_url,
            'statut'               => 'nouveau',
        ]);

        // Incrémenter le compteur de candidats
        $jobOffer->increment('nombre_candidats');

        return response()->json([
            'message'     => 'Candidature envoyée avec succès',
            'candidature' => $candidature->load('offre'),
        ], 201);
    }

    /** Candidat : voir ses candidatures */
    public function mesCandidatures(Request $request)
    {
        $candidatures = Application::where(
            'candidate_profile_id',
            $request->user()->profilCandidat->id
        )
            ->with('offre.entreprise', 'entretiens')
            ->latest()
            ->get();

        return response()->json($candidatures);
    }

    /** Recruteur : voir les candidatures pour une offre */
    public function parOffre(Request $request, JobOffer $jobOffer)
    {
        $candidatures = Application::where('job_offer_id', $jobOffer->id)
            ->with('candidat.utilisateur', 'candidat.competences')
            ->orderByDesc('score_matching_ia')
            ->paginate(10);

        return response()->json($candidatures);
    }

    /** Recruteur : changer le statut d'une candidature */
    public function changerStatut(Request $request, Application $application)
    {
        $request->validate([
            'statut'          => 'required|in:nouveau,preselection,examen,entretien,offre_envoyee,rejete,embauche',
            'notes_recruteur' => 'nullable|string',
        ]);

        $application->update([
            'statut'          => $request->statut,
            'notes_recruteur' => $request->notes_recruteur,
        ]);

        return response()->json([
            'message'     => 'Statut mis à jour',
            'candidature' => $application,
        ]);
    }
}
