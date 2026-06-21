<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
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

        // Lier automatiquement au profil recruteur
        $request->user()->profilRecruteur->update([
            'company_id' => $entreprise->id,
        ]);

        return response()->json([
            'message'    => 'Entreprise créée avec succès',
            'entreprise' => $entreprise,
        ], 201);
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

    /** Voir une entreprise */
    public function show(Company $company)
    {
        return response()->json(
            $company->load('offres', 'recruteurs')
        );
    }
}
