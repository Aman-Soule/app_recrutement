<?php

namespace App\Services;

use App\Models\AiMatchScore;
use App\Models\CandidateProfile;
use App\Models\JobOffer;
use App\Models\Skill;
use Illuminate\Support\Facades\Log;

class AiCvMatchingService
{
    public function __construct(
        private CvTextExtractor $extracteur,
        private GeminiClient $gemini,
        private MatchingService $matchingService,
    ) {}

    /** Scanne le CV du candidat par rapport à une offre et enregistre le score détaillé */
    public function scanner(CandidateProfile $profil, JobOffer $offre): AiMatchScore
    {
        $profil->loadMissing('competences');

        $texteCv = $this->extracteur->extraire($profil->cv_url);

        if (!$texteCv) {
            $raison = $profil->cv_url
                ? "le CV n'a pas pu être lu (format non pris en charge ou fichier illisible)"
                : "aucun CV n'est disponible sur le profil";

            return $this->scoreDeSecours($profil, $offre, $raison);
        }

        if (!config('services.gemini.key')) {
            return $this->scoreDeSecours($profil, $offre, "l'analyse IA n'est pas configurée pour le moment (clé API manquante)");
        }

        try {
            $donnees = $this->analyserAvecGemini($profil, $offre, $texteCv);
        } catch (\Throwable $e) {
            Log::warning("Échec de l'analyse IA du CV (candidat {$profil->id}, offre {$offre->id}) : " . $e->getMessage());
            return $this->scoreDeSecours($profil, $offre, "l'analyse IA du CV a échoué, un score basé sur le profil a été utilisé");
        }

        return AiMatchScore::updateOrCreate(
            ['candidate_profile_id' => $profil->id, 'job_offer_id' => $offre->id],
            [
                'score_global' => $donnees['score_global'],
                'score_competences' => $donnees['score_competences'],
                'score_experience' => $donnees['score_experience'],
                'score_localisation' => $donnees['score_localisation'],
                'score_salaire' => $donnees['score_salaire'],
                'competences_matchees' => $donnees['competences_matchees'],
                'competences_manquantes' => $donnees['competences_manquantes'],
                'resume_ia' => $donnees['resume'],
                'source' => 'ia',
                'calcule_le' => now(),
            ],
        );
    }

    private function analyserAvecGemini(CandidateProfile $profil, JobOffer $offre, string $texteCv): array
    {
        $competencesRequises = Skill::whereIn('id', $this->idsCompetencesRequises($offre))->pluck('nom')->all();
        $competencesProfil = $profil->competences->pluck('nom')->all();

        $prompt = <<<PROMPT
            Tu es un assistant de recrutement. Compare le CV d'un candidat à une offre d'emploi et évalue leur
            correspondance. Analyse d'abord le texte du CV pour en extraire les compétences réellement
            mentionnées, recoupe-les avec les compétences déclarées sur le profil du candidat (ci-dessous),
            puis compare cet ensemble aux compétences requises par l'offre avant de calculer les scores.
            Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises
            markdown, respectant exactement ce format :
            {
              "score_global": <entier 0-100>,
              "score_competences": <entier 0-100>,
              "score_experience": <entier 0-100>,
              "score_localisation": <entier 0-100>,
              "score_salaire": <entier 0-100>,
              "competences_matchees": [<chaînes>],
              "competences_manquantes": [<chaînes>],
              "resume": "<2 phrases maximum expliquant le score, en français>"
            }

            --- OFFRE D'EMPLOI ---
            Titre : {$offre->titre}
            Description : {$offre->description}
            Exigences : {$offre->exigences}
            Compétences requises : {$this->listeOuAucune($competencesRequises)}
            Type de lieu : {$offre->type_lieu}
            Type de contrat : {$offre->type_contrat}
            Salaire proposé : {$offre->salaire_min} - {$offre->salaire_max}

            --- COMPÉTENCES DÉCLARÉES SUR LE PROFIL DU CANDIDAT ---
            {$this->listeOuAucune($competencesProfil)}

            --- CV DU CANDIDAT (texte extrait du fichier) ---
            {$texteCv}
            PROMPT;

        $texte = $this->gemini->generer($prompt);
        $texte = trim(preg_replace('/^```(json)?|```$/m', '', trim($texte)));

        $donnees = json_decode($texte, true);

        if (!is_array($donnees) || !isset($donnees['score_global'])) {
            throw new \RuntimeException('Réponse Gemini non exploitable : ' . $texte);
        }

        return [
            'score_global' => $this->clamp($donnees['score_global'] ?? 0),
            'score_competences' => $this->clampNullable($donnees['score_competences'] ?? null),
            'score_experience' => $this->clampNullable($donnees['score_experience'] ?? null),
            'score_localisation' => $this->clampNullable($donnees['score_localisation'] ?? null),
            'score_salaire' => $this->clampNullable($donnees['score_salaire'] ?? null),
            'competences_matchees' => array_values(array_map('strval', $donnees['competences_matchees'] ?? [])),
            'competences_manquantes' => array_values(array_map('strval', $donnees['competences_manquantes'] ?? [])),
            'resume' => isset($donnees['resume']) ? (string) $donnees['resume'] : null,
        ];
    }

    /** Repli sans IA : score basé sur les données structurées du profil (pas de CV exploitable, clé absente ou échec IA) */
    private function scoreDeSecours(CandidateProfile $profil, JobOffer $offre, string $raison): AiMatchScore
    {
        $nomsCandidat = $profil->competences->pluck('nom')->all();
        $nomsRequis = Skill::whereIn('id', $this->idsCompetencesRequises($offre))->pluck('nom')->all();

        return AiMatchScore::updateOrCreate(
            ['candidate_profile_id' => $profil->id, 'job_offer_id' => $offre->id],
            [
                'score_global' => $this->matchingService->calculerScore($profil, $offre),
                'score_competences' => null,
                'score_experience' => null,
                'score_localisation' => null,
                'score_salaire' => null,
                'competences_matchees' => array_values(array_intersect($nomsRequis, $nomsCandidat)),
                'competences_manquantes' => array_values(array_diff($nomsRequis, $nomsCandidat)),
                'resume_ia' => "Score calculé à partir du profil (compétences, lieu, contrat) : {$raison}.",
                'source' => 'heuristique',
                'calcule_le' => now(),
            ],
        );
    }

    /** IDs numériques valides dans competences_requises (le champ peut contenir des données mal formées, ex. des noms) */
    private function idsCompetencesRequises(JobOffer $offre): array
    {
        return array_values(array_filter(
            $offre->competences_requises ?? [],
            fn($id) => is_numeric($id),
        ));
    }

    private function listeOuAucune(array $valeurs): string
    {
        return $valeurs ? implode(', ', $valeurs) : 'Aucune';
    }

    private function clamp(mixed $valeur): int
    {
        return (int) max(0, min(100, (int) $valeur));
    }

    private function clampNullable(mixed $valeur): ?int
    {
        return $valeur === null ? null : $this->clamp($valeur);
    }
}
