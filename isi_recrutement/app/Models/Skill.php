<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = [
        'nom',
        'categorie',
    ];

    // ---- Relations ----

    /** Candidats qui possèdent cette compétence */
    public function candidats()
    {
        return $this->belongsToMany(CandidateProfile::class, 'candidate_skills')
            ->withPivot('niveau', 'verifie', 'score_verification')
            ->withTimestamps();
    }
}
