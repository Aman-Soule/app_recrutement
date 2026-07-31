<?php

namespace App\Jobs;

use App\Models\Application;
use App\Services\AiCvMatchingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ScannerCandidatureJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(public int $applicationId) {}

    public function handle(AiCvMatchingService $service): void
    {
        $candidature = Application::with('candidat.competences', 'offre')->find($this->applicationId);

        if (!$candidature || !$candidature->candidat || !$candidature->offre) {
            Log::warning("ScannerCandidatureJob : candidature {$this->applicationId} introuvable ou incomplète.");
            return;
        }

        try {
            $score = $service->scanner($candidature->candidat, $candidature->offre);
        } catch (\Throwable $e) {
            Log::error("ScannerCandidatureJob : échec du calcul du score pour la candidature {$this->applicationId} : " . $e->getMessage());
            $candidature->update(['score_ia_erreur' => "Le calcul du score IA a échoué. Réessayez plus tard."]);
            return;
        }

        $candidature->update(['score_matching_ia' => $score->score_global, 'score_ia_erreur' => null]);
    }
}
