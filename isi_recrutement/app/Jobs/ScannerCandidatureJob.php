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

        $score = $service->scanner($candidature->candidat, $candidature->offre);

        $candidature->update(['score_matching_ia' => $score->score_global]);
    }
}
