<?php

namespace App\Services;

use App\Models\CandidateProfile;
use App\Models\JobOffer;

class MatchingService
{
    /** Calcul basique du score de matching IA entre un profil candidat et une offre */
    public function calculerScore(?CandidateProfile $profil, JobOffer $offre): int
    {
        if (!$profil || !$offre->competences_requises) {
            return 0;
        }

        $competencesCandidat = $profil->relationLoaded('competences')
            ? $profil->competences->pluck('id')->toArray()
            : $profil->competences()->pluck('skills.id')->toArray();

        $competencesRequises = $offre->competences_requises;
        $total = count($competencesRequises);

        if ($total === 0) {
            return 50;
        }

        $score = 0;

        // Score compétences (60%)
        $matchees = count(array_intersect($competencesCandidat, $competencesRequises));
        $score += ($matchees / $total) * 60;

        // Score type de lieu (20%)
        if ($profil->type_lieu_souhaite === $offre->type_lieu) {
            $score += 20;
        }

        // Score type de contrat (20%)
        if ($profil->type_contrat_souhaite === $offre->type_contrat) {
            $score += 20;
        }

        return (int) min($score, 100);
    }
}
