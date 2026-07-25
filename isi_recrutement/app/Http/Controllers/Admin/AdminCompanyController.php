<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class AdminCompanyController extends Controller
{
    /** Lister toutes les entreprises */
    public function index(Request $request)
    {
        $entreprises = Company::withCount(['recruteurs', 'offres'])
            ->when($request->recherche, function ($q) use ($request) {
                $q->where('nom', 'like', "%{$request->recherche}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json($entreprises);
    }

    /** Créer une entreprise */
    public function store(Request $request)
    {
        $request->validate([
            'nom'          => 'required|string|max:255',
            'secteur'      => 'nullable|string',
            'description'  => 'nullable|string',
            'site_web'     => 'nullable|url',
            'taille'       => 'nullable|in:startup,pme,grand_groupe',
            'localisation' => 'nullable|string',
        ]);

        $entreprise = Company::create($request->all());

        return response()->json([
            'message'    => 'Entreprise créée avec succès',
            'entreprise' => $entreprise,
        ], 201);
    }

    /** Voir le détail d'une entreprise */
    public function show(Company $company)
    {
        return response()->json(
            $company->load(['recruteurs.utilisateur', 'offres'])
        );
    }

    /** Mettre à jour une entreprise */
    public function update(Request $request, Company $company)
    {
        $request->validate([
            'nom'          => 'nullable|string|max:255',
            'secteur'      => 'nullable|string',
            'description'  => 'nullable|string',
            'site_web'     => 'nullable|url',
            'taille'       => 'nullable|in:startup,pme,grand_groupe',
            'localisation' => 'nullable|string',
        ]);

        $company->update($request->all());

        return response()->json([
            'message'    => 'Entreprise mise à jour',
            'entreprise' => $company,
        ]);
    }

    /** Supprimer une entreprise (supprime en cascade ses offres d'emploi) */
    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json(['message' => 'Entreprise supprimée']);
    }
}
