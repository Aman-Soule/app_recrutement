<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'expediteur_id',
        'destinataire_id',
        'application_id',
        'contenu',
        'lu',
        'lu_le',
    ];

    protected $casts = [
        'lu' => 'boolean',
        'lu_le' => 'datetime',
    ];

    // ---- Relations ----

    /** Utilisateur qui a envoyé le message */
    public function expediteur()
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    /** Utilisateur qui reçoit le message */
    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    /** Candidature liée au message */
    public function candidature()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }
}
