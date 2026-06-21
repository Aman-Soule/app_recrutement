<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobOffer extends Model
{
    protected $fillable = [
        'company_id',
        'recruiter_profile_id',
        'reference',
        'titre',
        'departement',
        'description',
        'exigences',
        'localisation',
        'type_lieu',
        'type_contrat',
        'salaire_min',
        'salaire_max',
        'statut',
        'competences_requises',
        'nombre_candidats',
        'publie_le',
    ];

    protected $casts = [
        'competences_requises' => 'array', // JSON auto-casté en tableau
        'publie_le' => 'datetime',
    ];

    // ---- Relations ----

    /** Entreprise qui publie l'offre */
    public function entreprise()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /** Recruteur responsable de l'offre */
    public function recruteur()
    {
        return $this->belongsTo(RecruiterProfile::class, 'recruiter_profile_id');
    }

    /** Candidatures reçues pour cette offre */
    public function candidatures()
    {
        return $this->hasMany(Application::class);
    }

    /** Scores de matching IA pour cette offre */
    public function scoresMatching()
    {
        return $this->hasMany(AiMatchScore::class);
    }
}
