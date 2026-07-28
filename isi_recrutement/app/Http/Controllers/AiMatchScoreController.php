<?php

namespace App\Http\Controllers;

use App\Models\AiMatchScore;
use App\Models\Application;
use App\Models\JobOffer;
use App\Services\AiCvMatchingService;
use Illuminate\Http\Request;

class AiMatchScoreController extends Controller
{
    /** Candidat : lance (ou relance) l'analyse IA de son CV pour une offre donnée */
    public function calculer(Request $request, JobOffer $jobOffer, AiCvMatchingService $service)
    {
        $profil = $request->user()->profilCandidat;

        if (!$profil->cv_url) {
            return response()->json([
                'message' => "Veuillez ajouter un CV à votre profil avant de lancer l'analyse IA.",
            ], 422);
        }

        $score = $service->scanner($profil, $jobOffer);

        // Garde la candidature existante (si elle existe) synchronisée avec ce score
        Application::where('candidate_profile_id', $profil->id)
            ->where('job_offer_id', $jobOffer->id)
            ->update(['score_matching_ia' => $score->score_global]);

        return response()->json($score);
    }

    /** Recruteur : classement des candidats par score IA pour une de ses offres */
    public function meilleursCandidats(Request $request, JobOffer $jobOffer)
    {
        $recruteur = $request->user()->profilRecruteur;

        abort_unless($jobOffer->recruiter_profile_id === $recruteur->id, 403, "Vous n'avez pas accès à cette offre.");

        $classement = AiMatchScore::where('job_offer_id', $jobOffer->id)
            ->with('candidat.utilisateur')
            ->orderByDesc('score_global')
            ->paginate(10);

        return response()->json($classement);
    }
}
