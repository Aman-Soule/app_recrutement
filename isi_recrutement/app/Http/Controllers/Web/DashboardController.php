<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\JobOffer;
use App\Models\Application;
use App\Models\Interview;
use App\Models\CandidateProfile;

class DashboardController extends Controller
{
    /** Dashboard Candidat */
    public function candidatDashboard()
    {
        return view('candidat.dashboard');
    }

    /** Dashboard Recruteur */
    public function recruteurDashboard()
    {
        $stats = [
            'offres_actives'        => JobOffer::where('statut', 'actif')->count(),
            'nouvelles_candidatures' => Application::where('statut', 'nouveau')->count(),
            'entretiens_aujourdhui' => Interview::whereDate('planifie_le', today())->count(),
            'offres_envoyees'       => Application::where('statut', 'offre_envoyee')->count(),
        ];

        $candidatures_recentes = Application::with('candidat.utilisateur', 'offre')
            ->latest()
            ->take(5)
            ->get();

        return view('recruteur.dashboard', compact('stats', 'candidatures_recentes'));
    }

    /** Gestion des offres */
    public function offres()
    {
        $stats = [
            'offres_actives'   => JobOffer::where('statut', 'actif')->count(),
            'brouillons'       => JobOffer::where('statut', 'brouillon')->count(),
            'total_candidats'  => Application::count(),
            'postes_pourvus'   => Application::where('statut', 'embauche')->count(),
        ];

        $offres = JobOffer::with('entreprise', 'recruteur')
            ->latest()
            ->paginate(10);

        return view('recruteur.offres', compact('stats', 'offres'));
    }

    /** Base de candidats */
    public function candidats()
    {
        $candidats = CandidateProfile::with('utilisateur', 'competences', 'candidatures')
            ->latest()
            ->paginate(10);

        return view('recruteur.candidats', compact('candidats'));
    }

    /** Gestion des entretiens */
    public function entretiens()
    {
        $entretiens = Interview::with(
            'candidature.candidat.utilisateur',
            'candidature.offre',
            'recruteur.utilisateur'
        )
            ->orderBy('planifie_le')
            ->get();

        return view('recruteur.entretiens', compact('entretiens'));
    }

    /** Paramètres */
    public function parametres()
    {
        return view('recruteur.parametres');
    }
}
