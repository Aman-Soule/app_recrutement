<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'candidate_profile_id',
        'job_offer_id',
        'statut',
        'score_matching_ia',
        'score_ia_erreur',
        'lettre_motivation',
        'lettre_motivation_url',
        'cv_url',
        'notes_recruteur',
        'postule_le',
    ];

    protected $casts = [
        'postule_le' => 'datetime',
    ];

    // ---- Relations ----

    /** Candidat qui a postulé */
    public function candidat()
    {
        return $this->belongsTo(CandidateProfile::class, 'candidate_profile_id');
    }

    /** Offre d'emploi concernée */
    public function offre()
    {
        return $this->belongsTo(JobOffer::class, 'job_offer_id');
    }

    /** Entretiens liés à cette candidature */
    public function entretiens()
    {
        return $this->hasMany(Interview::class);
    }

    /** Messages liés à cette candidature */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
