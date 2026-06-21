<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'nom',
        'secteur',
        'description',
        'logo_url',
        'site_web',
        'taille',
        'localisation',
    ];

    // ---- Relations ----

    /** Recruteurs appartenant à cette entreprise */
    public function recruteurs()
    {
        return $this->hasMany(RecruiterProfile::class);
    }

    /** Offres d'emploi publiées par cette entreprise */
    public function offres()
    {
        return $this->hasMany(JobOffer::class);
    }
}
