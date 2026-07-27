<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'actif' => 'boolean',
        ];
    }

    // ---- Relations ----

    /** Profil candidat lié à cet utilisateur */
    public function profilCandidat()
    {
        return $this->hasOne(CandidateProfile::class);
    }

    /** Profil recruteur lié à cet utilisateur */
    public function profilRecruteur()
    {
        return $this->hasOne(RecruiterProfile::class);
    }

    /** Messages envoyés par cet utilisateur */
    public function messagesEnvoyes()
    {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    /** Messages reçus par cet utilisateur */
    public function messagesRecus()
    {
        return $this->hasMany(Message::class, 'destinataire_id');
    }

    // ---- Helpers ----

    public function estCandidat(): bool
    {
        return $this->role === 'candidate';
    }

    public function estRecruteur(): bool
    {
        return $this->role === 'recruiter';
    }

    public function estAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function estActif(): bool
    {
        return (bool) $this->actif;
    }
}
