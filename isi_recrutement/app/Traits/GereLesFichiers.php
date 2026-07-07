<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait GereLesFichiers
{
    /** Supprime l'ancien fichier du disque public à partir de son URL stockée */
    private function supprimerAncienFichier(?string $url): void
    {
        if (!$url) {
            return;
        }

        $chemin = ltrim((string) parse_url($url, PHP_URL_PATH), '/');
        $chemin = preg_replace('#^storage/#', '', $chemin);

        if ($chemin && Storage::disk('public')->exists($chemin)) {
            Storage::disk('public')->delete($chemin);
        }
    }
}
