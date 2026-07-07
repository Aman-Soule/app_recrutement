<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoginNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $connecteLe,
        public string $adresseIp,
    ) {}

    public function build(): self
    {
        return $this->subject('Nouvelle connexion à votre compte TalentAI')
            ->view('emails.login-notification');
    }
}
