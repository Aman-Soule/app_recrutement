<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusChanged extends Notification
{
    use Queueable;

    private const LIBELLES = [
        'nouveau'       => 'Nouveau',
        'preselection'  => 'Présélectionnée',
        'examen'        => "En cours d'examen",
        'entretien'     => 'Entretien',
        'offre_envoyee' => 'Offre envoyée',
        'rejete'        => 'Non retenue',
        'embauche'      => 'Embauché(e)',
    ];

    public function __construct(private Application $application) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $offre = $this->application->offre->titre;
        $libelle = self::LIBELLES[$this->application->statut] ?? $this->application->statut;

        $message = (new MailMessage)
            ->subject("Votre candidature a évolué : {$offre}")
            ->greeting('Bonjour ' . $notifiable->name . ',');

        if ($this->application->statut === 'embauche') {
            $message->line("Excellente nouvelle ! Votre candidature pour \"{$offre}\" a été retenue. Félicitations !");
        } elseif ($this->application->statut === 'rejete') {
            $message->line("Nous vous informons que votre candidature pour \"{$offre}\" n'a pas été retenue cette fois-ci.");
        } else {
            $message->line("Le statut de votre candidature pour \"{$offre}\" est passé à : {$libelle}.");
        }

        return $message
            ->action('Voir mes candidatures', url('/candidate/applications'))
            ->line('Connectez-vous à TalentAI pour plus de détails.');
    }

    public function toArray(object $notifiable): array
    {
        $offre = $this->application->offre->titre;
        $libelle = self::LIBELLES[$this->application->statut] ?? $this->application->statut;

        return [
            'titre'   => 'Candidature mise à jour',
            'message' => "Votre candidature pour \"{$offre}\" est maintenant : {$libelle}",
            'url'     => '/candidate/applications',
        ];
    }
}
