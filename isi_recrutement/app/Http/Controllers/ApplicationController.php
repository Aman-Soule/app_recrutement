<?php

namespace App\Http\Controllers;

use App\Jobs\ScannerCandidatureJob;
use App\Models\AiMatchScore;
use App\Models\Application;
use App\Models\JobOffer;
use App\Notifications\ApplicationStatusChanged;
use App\Notifications\ApplicationSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    /** Candidat : postuler à une offre */
    public function store(Request $request, JobOffer $jobOffer)
    {
        $request->validate([
            'lettre_motivation'         => 'nullable|string',
            'lettre_motivation_fichier' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'cv_url'                    => 'nullable|string',
        ]);

        $profil = $request->user()->profilCandidat;

        // Vérifier si déjà postulé
        $dejaPostule = Application::where('candidate_profile_id', $profil->id)
            ->where('job_offer_id', $jobOffer->id)
            ->exists();

        if ($dejaPostule) {
            return response()->json(['message' => 'Vous avez déjà postulé à cette offre'], 409);
        }

        $lettreMotivationUrl = null;
        if ($request->hasFile('lettre_motivation_fichier')) {
            $chemin = $request->file('lettre_motivation_fichier')->store('lettres-motivation', 'public');
            $lettreMotivationUrl = Storage::disk('public')->url($chemin);
        }

        $candidature = Application::create([
            'candidate_profile_id'   => $profil->id,
            'job_offer_id'           => $jobOffer->id,
            'lettre_motivation'      => $request->lettre_motivation,
            'lettre_motivation_url'  => $lettreMotivationUrl,
            'cv_url'                 => $request->cv_url ?? $profil->cv_url,
            'statut'                 => 'nouveau',
            // score_matching_ia est calculé juste après par ScannerCandidatureJob (file d'attente "sync" en local)
        ]);

        // Incrémenter le compteur de candidats
        $jobOffer->increment('nombre_candidats');

        $this->notifierRecruteurNouvelleCandidature($candidature, $jobOffer);

        ScannerCandidatureJob::dispatch($candidature->id);

        // Le job met à jour la ligne en base sur sa propre instance : on recharge la nôtre
        // pour renvoyer le score au front (utile pour l'animation de matching à la soumission).
        $candidature->refresh()->load('offre');
        $this->attacherScoreDetaille($candidature);

        return response()->json([
            'message'     => 'Candidature envoyée avec succès',
            'candidature' => $candidature,
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

        $this->attacherScoresDetaillees($candidatures);

        return response()->json($candidatures);
    }

    /** Candidat : voir le détail d'une de ses candidatures */
    public function voir(Request $request, Application $application)
    {
        if ($application->candidate_profile_id !== $request->user()->profilCandidat->id) {
            abort(403, "Vous n'avez pas accès à cette candidature.");
        }

        $application->load('offre.entreprise', 'entretiens.recruteur.utilisateur');
        $this->attacherScoreDetaille($application);

        return response()->json($application);
    }

    /** Candidat : relancer le calcul du score IA après un échec (ou un blocage) */
    public function relancerScoreIa(Request $request, Application $application)
    {
        if ($application->candidate_profile_id !== $request->user()->profilCandidat->id) {
            abort(403, "Vous n'avez pas accès à cette candidature.");
        }

        if ($application->score_matching_ia !== null) {
            return response()->json(['message' => 'Le score IA a déjà été calculé.'], 409);
        }

        $application->update(['score_ia_erreur' => null]);

        ScannerCandidatureJob::dispatch($application->id);

        $application->refresh()->load('offre.entreprise', 'entretiens.recruteur.utilisateur');
        $this->attacherScoreDetaille($application);

        return response()->json($application);
    }

    /** Recruteur : voir les candidatures pour une offre */
    public function parOffre(Request $request, JobOffer $jobOffer)
    {
        $candidatures = Application::where('job_offer_id', $jobOffer->id)
            ->with('candidat.utilisateur', 'candidat.competences')
            ->orderByDesc('score_matching_ia')
            ->paginate(10);

        $this->attacherScoresDetaillees($candidatures);

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
            ->paginate($request->integer('per_page', 10));

        $this->attacherScoresDetaillees($candidatures);

        return response()->json($candidatures);
    }

    /** Attache le score IA détaillé (sous-scores, compétences matchées/manquantes) à une candidature */
    private function attacherScoreDetaille(Application $application): void
    {
        $score = AiMatchScore::where('candidate_profile_id', $application->candidate_profile_id)
            ->where('job_offer_id', $application->job_offer_id)
            ->first();

        $application->setRelation('scoreDetaille', $score);
    }

    /** Attache le score IA détaillé à une liste (ou page) de candidatures, en une seule requête */
    private function attacherScoresDetaillees(mixed $candidatures): void
    {
        $collection = $candidatures instanceof \Illuminate\Contracts\Pagination\Paginator
            ? $candidatures->getCollection()
            : $candidatures;

        if ($collection->isEmpty()) {
            return;
        }

        $paires = $collection
            ->map(fn (Application $c) => [$c->candidate_profile_id, $c->job_offer_id])
            ->unique(fn (array $p) => implode('_', $p));

        $scores = AiMatchScore::query()
            ->where(function ($q) use ($paires) {
                foreach ($paires as [$candidateId, $offerId]) {
                    $q->orWhere(function ($qq) use ($candidateId, $offerId) {
                        $qq->where('candidate_profile_id', $candidateId)->where('job_offer_id', $offerId);
                    });
                }
            })
            ->get()
            ->keyBy(fn (AiMatchScore $s) => $s->candidate_profile_id . '_' . $s->job_offer_id);

        $collection->each(fn (Application $c) => $c->setRelation(
            'scoreDetaille',
            $scores->get($c->candidate_profile_id . '_' . $c->job_offer_id),
        ));
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
