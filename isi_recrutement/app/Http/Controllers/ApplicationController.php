<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\JobOffer;
use App\Notifications\ApplicationStatusChanged;
use App\Notifications\ApplicationSubmitted;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApplicationController extends Controller
{
    public function __construct(private MatchingService $matchingService) {}

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

        $profil->loadMissing('competences');

        $candidature = Application::create([
            'candidate_profile_id' => $profil->id,
            'job_offer_id'         => $jobOffer->id,
            'lettre_motivation'    => $request->lettre_motivation,
            'cv_url'               => $request->cv_url ?? $profil->cv_url,
            'statut'               => 'nouveau',
            'score_matching_ia'    => $this->matchingService->calculerScore($profil, $jobOffer),
        ]);

        // Incrémenter le compteur de candidats
        $jobOffer->increment('nombre_candidats');

        $this->notifierRecruteurNouvelleCandidature($candidature, $jobOffer);

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

    /** Recruteur : voir toutes les candidatures reçues sur ses offres */
    public function pourRecruteur(Request $request)
    {
        $recruteur = $request->user()->profilRecruteur;

        $candidatures = Application::whereHas('offre', function ($q) use ($recruteur) {
                $q->where('recruiter_profile_id', $recruteur->id);
            })
            ->with('candidat.utilisateur', 'offre')
            ->latest()
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

        $this->notifierCandidatChangementStatut($application);

        return response()->json([
            'message'     => 'Statut mis à jour',
            'candidature' => $application,
        ]);
    }

    /** Notifie le recruteur responsable de l'offre qu'une nouvelle candidature est arrivée */
    private function notifierRecruteurNouvelleCandidature(Application $candidature, JobOffer $jobOffer): void
    {
        try {
            $jobOffer->loadMissing('recruteur.utilisateur');
            $candidature->loadMissing('candidat.utilisateur', 'offre');
            $jobOffer->recruteur?->utilisateur?->notify(new ApplicationSubmitted($candidature));
        } catch (\Throwable $e) {
            Log::warning('Échec de la notification de nouvelle candidature : ' . $e->getMessage());
        }
    }

    /** Notifie le candidat que le statut de sa candidature a changé */
    private function notifierCandidatChangementStatut(Application $application): void
    {
        try {
            $application->loadMissing('candidat.utilisateur', 'offre');
            $application->candidat?->utilisateur?->notify(new ApplicationStatusChanged($application));
        } catch (\Throwable $e) {
            Log::warning('Échec de la notification de changement de statut : ' . $e->getMessage());
        }
    }
}
