<?php

namespace App\Notifications;

use App\Models\Interview;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InterviewScheduled extends Notification
{
    use Queueable;

    public function __construct(private Interview $interview) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $offre = $this->interview->candidature->offre->titre;
        $date = $this->interview->planifie_le->format('d/m/Y à H:i');

        return (new MailMessage)
            ->subject('Entretien programmé')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line("Un entretien a été programmé pour votre candidature à \"{$offre}\".")
            ->line("Date : {$date}")
            ->line('Lieu / lien : ' . ($this->interview->lieu_ou_lien ?? 'à confirmer'))
            ->action('Voir mes candidatures', url('/candidate/applications'))
            ->line('Connectez-vous à TalentAI pour plus de détails.');
    }

    public function toArray(object $notifiable): array
    {
        $offre = $this->interview->candidature->offre->titre;
        $date = $this->interview->planifie_le->format('d/m/Y à H:i');

        return [
            'titre'   => 'Entretien programmé',
            'message' => "Entretien pour \"{$offre}\" le {$date}",
            'url'     => '/candidate/applications',
        ];
    }
}
