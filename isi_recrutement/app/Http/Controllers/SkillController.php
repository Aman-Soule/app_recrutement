<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    /** Lister toutes les compétences (pour le formulaire de profil) */
    public function index(Request $request)
    {
        $competences = Skill::query()
            ->when($request->categorie, fn($q) => $q->where('categorie', $request->categorie))
            ->when($request->recherche, fn($q) => $q->where('nom', 'like', "%{$request->recherche}%"))
            ->orderBy('categorie')
            ->orderBy('nom')
            ->get();

        return response()->json($competences);
    }

    /** Créer une compétence (admin) */
    public function store(Request $request)
    {
        $request->validate([
            'nom'       => 'required|string|unique:skills,nom',
            'categorie' => 'nullable|string',
        ]);

        $competence = Skill::create($request->all());

        return response()->json([
            'message'     => 'Compétence créée',
            'competence'  => $competence,
        ], 201);
    }
}
