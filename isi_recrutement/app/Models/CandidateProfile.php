<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidateProfile extends Model
{
    protected $fillable = [
        'user_id',
        'titre',
        'biographie',
        'localisation',
        'avatar_url',
        'cv_url',
        'portfolio_url',
        'linkedin_url',
        'annees_experience',
        'force_profil',
        'score_employabilite',
        'disponibilite',
        'salaire_min_souhaite',
        'salaire_max_souhaite',
        'type_contrat_souhaite',
        'type_lieu_souhaite',
    ];

    // ---- Relations ----

    /** Utilisateur propriétaire du profil */
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Compétences du candidat (avec niveau et vérification) */
    public function competences()
    {
        return $this->belongsToMany(Skill::class, 'candidate_skills')
            ->withPivot('niveau', 'verifie', 'score_verification')
            ->withTimestamps();
    }

    /** Candidatures soumises par ce candidat */
    public function candidatures()
    {
        return $this->hasMany(Application::class);
    }

    /** Scores de matching IA calculés pour ce candidat */
    public function scoresMatching()
    {
        return $this->hasMany(AiMatchScore::class);
    }

    /** Entretiens passés via ses candidatures */
    public function entretiens()
    {
        return $this->hasManyThrough(Interview::class, Application::class);
    }
}
