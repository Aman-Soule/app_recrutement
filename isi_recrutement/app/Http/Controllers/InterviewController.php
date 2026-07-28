<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use App\Models\Application;
use App\Notifications\InterviewScheduled;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InterviewController extends Controller
{
    /** Recruteur : planifier un entretien */
    public function store(Request $request, Application $application)
    {
        $request->validate([
            'type'               => 'required|in:video,physique,telephonique',
            'etape'              => 'required|in:rh,technique,culturel,final',
            'planifie_le'        => 'required|date|after:now',
            'duree_minutes'      => 'nullable|integer|min:15|max:240',
            'lieu_ou_lien'       => 'nullable|string',
            'plateforme'         => 'nullable|string',
            'notes_preparation'  => 'nullable|string',
        ]);

        $recruteur = $request->user()->profilRecruteur;

        $entretien = Interview::create([
            ...$request->all(),
            'application_id'       => $application->id,
            'recruiter_profile_id' => $recruteur->id,
            'statut'               => 'en_attente',
        ]);

        // Mettre à jour le statut de la candidature
        $application->update(['statut' => 'entretien']);

        $entretien->load('candidature.candidat.utilisateur', 'candidature.offre');

        try {
            $entretien->candidature->candidat?->utilisateur?->notify(new InterviewScheduled($entretien));
        } catch (\Throwable $e) {
            Log::warning('Échec de la notification d\'entretien planifié : ' . $e->getMessage());
        }

        return response()->json([
            'message'   => 'Entretien planifié avec succès',
            'entretien' => $entretien,
        ], 201);
    }

    /** Lister les entretiens du recruteur */
    public function index(Request $request)
    {
        $entretiens = Interview::where(
            'recruiter_profile_id',
            $request->user()->profilRecruteur->id
        )
            ->with('candidature.candidat.utilisateur', 'candidature.offre')
            ->when($request->statut, fn($q) => $q->where('statut', $request->statut))
            ->orderBy('planifie_le')
            ->get();

        return response()->json($entretiens);
    }

    /** Candidat : confirmer sa présence à un entretien proposé par le recruteur */
    public function confirmer(Request $request, Interview $interview)
    {
        $interview->loadMissing('candidature');

        if ($interview->candidature->candidate_profile_id !== $request->user()->profilCandidat->id) {
            abort(403, "Vous n'avez pas accès à cet entretien.");
        }

        if ($interview->statut !== 'en_attente') {
            return response()->json(['message' => 'Cet entretien ne peut plus être confirmé.'], 422);
        }

        $interview->update(['statut' => 'confirme']);

        return response()->json([
            'message'   => 'Entretien confirmé',
            'entretien' => $interview,
        ]);
    }

    /** Ajouter un feedback après l'entretien */
    public function feedback(Request $request, Interview $interview)
    {
        $request->validate([
            'note'     => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string',
            'statut'   => 'required|in:termine,annule',
        ]);

        $interview->update($request->all());

        return response()->json([
            'message'   => 'Feedback enregistré',
            'entretien' => $interview,
        ]);
    }
}
