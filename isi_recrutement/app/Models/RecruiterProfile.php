<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruiterProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'titre',
        'avatar_url',
        'telephone',
        'forfait',
    ];

    // ---- Relations ----

    /** Utilisateur propriétaire du profil */
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Entreprise du recruteur */
    public function entreprise()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /** Offres d'emploi publiées par ce recruteur */
    public function offres()
    {
        return $this->hasMany(JobOffer::class);
    }

    /** Entretiens planifiés par ce recruteur */
    public function entretiens()
    {
        return $this->hasMany(Interview::class);
    }
}
