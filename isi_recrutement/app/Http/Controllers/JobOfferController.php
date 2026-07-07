<?php

namespace App\Http\Controllers;

use App\Models\JobOffer;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JobOfferController extends Controller
{
    public function __construct(private MatchingService $matchingService) {}

    /** Lister les offres (avec filtres) */
    public function index(Request $request)
    {
        $offres = JobOffer::with('entreprise', 'recruteur')
            ->when($request->statut, fn($q) => $q->where('statut', $request->statut))
            ->when($request->type_lieu, fn($q) => $q->where('type_lieu', $request->type_lieu))
            ->when($request->type_contrat, fn($q) => $q->where('type_contrat', $request->type_contrat))
            ->when($request->recherche, fn($q) => $q->where('titre', 'like', "%{$request->recherche}%"))
            ->when($request->boolean('mine') && $request->user()->estRecruteur(), function ($q) use ($request) {
                $q->where('recruiter_profile_id', $request->user()->profilRecruteur->id);
            })
            ->latest('publie_le')
            ->paginate(10);

        return response()->json($offres);
    }

    /** Voir une offre en détail */
    public function show(JobOffer $jobOffer)
    {
        return response()->json(
            $jobOffer->load('entreprise', 'recruteur', 'candidatures')
        );
    }

    /** Créer une offre (recruteur) */
    public function store(Request $request)
    {
        $request->validate([
            'titre'               => 'required|string|max:255',
            'departement'         => 'nullable|string',
            'description'         => 'nullable|string',
            'exigences'           => 'nullable|string',
            'localisation'        => 'nullable|string',
            'type_lieu'           => 'nullable|in:teletravail,hybride,presentiel',
            'type_contrat'        => 'nullable|in:temps_plein,temps_partiel,freelance,stage',
            'salaire_min'         => 'nullable|string',
            'salaire_max'         => 'nullable|string',
            'statut'              => 'nullable|in:brouillon,actif,ferme',
            'competences_requises' => 'nullable|array',
        ]);

        $recruteur = $request->user()->profilRecruteur;

        if (!$recruteur->company_id) {
            return response()->json([
                'message' => "Vous devez d'abord renseigner votre entreprise dans les Paramètres avant de publier une offre.",
            ], 422);
        }

        $offre = JobOffer::create([
            ...$request->all(),
            'company_id'           => $recruteur->company_id,
            'recruiter_profile_id' => $recruteur->id,
            'reference'            => 'REF-' . strtoupper(Str::random(8)),
            'publie_le'            => $request->statut === 'actif' ? now() : null,
        ]);

        return response()->json([
            'message' => 'Offre créée avec succès',
            'offre'   => $offre->load('entreprise'),
        ], 201);
    }

    /** Modifier une offre */
    public function update(Request $request, JobOffer $jobOffer)
    {
        $request->validate([
            'titre'                => 'nullable|string|max:255',
            'statut'               => 'nullable|in:brouillon,actif,ferme',
            'competences_requises' => 'nullable|array',
        ]);

        // Mettre à jour la date de publication si l'offre devient active
        if ($request->statut === 'actif' && $jobOffer->statut !== 'actif') {
            $jobOffer->publie_le = now();
        }

        $jobOffer->update($request->all());

        return response()->json([
            'message' => 'Offre mise à jour',
            'offre'   => $jobOffer,
        ]);
    }

    /** Supprimer une offre */
    public function destroy(JobOffer $jobOffer)
    {
        $jobOffer->delete();
        return response()->json(['message' => 'Offre supprimée']);
    }

    /** Offres recommandées pour le candidat connecté (matching IA) */
    public function recommandees(Request $request)
    {
        $profil = $request->user()->profilCandidat()->with('competences')->first();

        $offres = JobOffer::where('statut', 'actif')
            ->with('entreprise', 'scoresMatching')
            ->get()
            ->map(function ($offre) use ($profil) {
                $offre->score_matching = $this->matchingService->calculerScore($profil, $offre);
                return $offre;
            })
            ->sortByDesc('score_matching')
            ->take(10)
            ->values();

        return response()->json($offres);
    }
}
