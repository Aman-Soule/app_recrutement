<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiClient
{
    /** Envoie un prompt à l'API Gemini et retourne le texte généré */
    public function generer(string $prompt): string
    {
        $cle = config('services.gemini.key');

        if (!$cle) {
            throw new RuntimeException('Aucune clé GEMINI_API_KEY configurée.');
        }

        $modele = config('services.gemini.model', 'gemini-2.0-flash');

        $reponse = Http::timeout(20)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$modele}:generateContent?key={$cle}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                ],
            ]);

        if ($reponse->failed()) {
            throw new RuntimeException('Appel Gemini échoué : ' . $reponse->status() . ' ' . $reponse->body());
        }

        $texte = $reponse->json('candidates.0.content.parts.0.text');

        if (!$texte) {
            throw new RuntimeException('Réponse Gemini vide ou inattendue.');
        }

        return $texte;
    }
}
