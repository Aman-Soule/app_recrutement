<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationSubmitted extends Notification
{
    use Queueable;

    public function __construct(private Application $application) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $candidat = $this->application->candidat->utilisateur->name;
        $offre = $this->application->offre->titre;

        return (new MailMessage)
            ->subject('Nouvelle candidature reçue')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line("{$candidat} vient de postuler à votre offre \"{$offre}\".")
            ->action('Voir le profil du candidat', url('/recruiter/candidates/' . $this->application->candidate_profile_id))
            ->line('Connectez-vous à TalentAI pour consulter le profil complet du candidat.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'titre'   => 'Nouvelle candidature',
            'message' => $this->application->candidat->utilisateur->name . ' a postulé à "' . $this->application->offre->titre . '"',
            'url'     => '/recruiter/candidates/' . $this->application->candidate_profile_id,
        ];
    }
}
