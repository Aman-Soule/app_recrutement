<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiMatchScore extends Model
{
    protected $fillable = [
        'candidate_profile_id',
        'job_offer_id',
        'score_global',
        'score_competences',
        'score_experience',
        'score_localisation',
        'score_salaire',
        'competences_matchees',
        'competences_manquantes',
        'resume_ia',
        'source',
        'calcule_le',
    ];

    protected $casts = [
        'competences_matchees'   => 'array', // JSON auto-casté
        'competences_manquantes' => 'array',
        'calcule_le'             => 'datetime',
    ];

    // ---- Relations ----

    /** Candidat évalué */
    public function candidat()
    {
        return $this->belongsTo(CandidateProfile::class, 'candidate_profile_id');
    }

    /** Offre comparée */
    public function offre()
    {
        return $this->belongsTo(JobOffer::class, 'job_offer_id');
    }
}
