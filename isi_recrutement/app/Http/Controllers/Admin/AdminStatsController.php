<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use App\Models\JobOffer;
use App\Models\RecruiterProfile;
use App\Models\User;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    /**
     * Chiffres clés de l'application, filtrables par entreprise (?company_id=).
     *
     * Les candidats n'ont pas de company_id (seuls recruteurs et offres sont
     * rattachés à une entreprise) : "candidats" filtré par entreprise correspond
     * donc au nombre de candidats distincts ayant postulé à une offre de cette
     * entreprise, pas à une appartenance directe.
     */
    public function index(Request $request)
    {
        $companyId = $request->company_id ? (int) $request->company_id : null;

        $recruteursCount = RecruiterProfile::when($companyId, function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->count();

        $offresActivesCount = JobOffer::where('statut', 'actif')
            ->when($companyId, function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->count();

        $candidaturesQuery = Application::whereHas('offre', function ($q) use ($companyId) {
            $q->when($companyId, function ($q2) use ($companyId) {
                $q2->where('company_id', $companyId);
            });
        });

        $candidatsCount = $companyId
            ? (clone $candidaturesQuery)->distinct('candidate_profile_id')->count('candidate_profile_id')
            : User::where('role', 'candidate')->count();

        $embauchesCount = (clone $candidaturesQuery)->where('statut', 'embauche')->count();

        return response()->json([
            'entreprises'    => $companyId ? 1 : Company::count(),
            'recruteurs'     => $recruteursCount,
            'candidats'      => $candidatsCount,
            'offres_actives' => $offresActivesCount,
            'candidatures'   => $candidaturesQuery->count(),
            'embauches'      => $embauchesCount,
            'company_id'     => $companyId,
        ]);
    }
}
