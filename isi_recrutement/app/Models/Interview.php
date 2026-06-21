<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $fillable = [
        'application_id',
        'recruiter_profile_id',
        'type',
        'etape',
        'planifie_le',
        'duree_minutes',
        'lieu_ou_lien',
        'plateforme',
        'statut',
        'notes_preparation',
        'note',
        'feedback',
    ];

    protected $casts = [
        'planifie_le' => 'datetime',
    ];

    // ---- Relations ----

    /** Candidature concernée par cet entretien */
    public function candidature()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    /** Recruteur qui mène l'entretien */
    public function recruteur()
    {
        return $this->belongsTo(RecruiterProfile::class, 'recruiter_profile_id');
    }
}
