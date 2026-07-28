<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory;
use Smalot\PdfParser\Parser as PdfParser;

class CvTextExtractor
{
    private const LONGUEUR_MAX = 15000;

    /** Extrait le texte brut d'un CV (PDF ou DOC/DOCX) stocké sur le disque public, à partir de son URL */
    public function extraire(?string $cvUrl): ?string
    {
        if (!$cvUrl) {
            return null;
        }

        $chemin = ltrim((string) parse_url($cvUrl, PHP_URL_PATH), '/');
        $chemin = preg_replace('#^storage/#', '', $chemin);

        if (!$chemin || !Storage::disk('public')->exists($chemin)) {
            return null;
        }

        $cheminAbsolu = Storage::disk('public')->path($chemin);
        $extension = strtolower(pathinfo($cheminAbsolu, PATHINFO_EXTENSION));

        try {
            $texte = match ($extension) {
                'pdf' => (new PdfParser())->parseFile($cheminAbsolu)->getText(),
                'doc', 'docx' => $this->extraireDocx($cheminAbsolu, $extension),
                default => null,
            };
        } catch (\Throwable $e) {
            Log::warning("Échec de l'extraction du texte du CV ({$chemin}) : " . $e->getMessage());
            return null;
        }

        $texte = trim((string) $texte);

        return $texte !== '' ? mb_substr($texte, 0, self::LONGUEUR_MAX) : null;
    }

    private function extraireDocx(string $cheminAbsolu, string $extension): string
    {
        $type = $extension === 'doc' ? 'MsDoc' : 'Word2007';
        $document = IOFactory::load($cheminAbsolu, $type);

        $texte = '';
        foreach ($document->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $texte .= $element->getText() . "\n";
                } elseif (method_exists($element, 'getElements')) {
                    foreach ($element->getElements() as $sousElement) {
                        if (method_exists($sousElement, 'getText')) {
                            $texte .= $sousElement->getText() . ' ';
                        }
                    }
                    $texte .= "\n";
                }
            }
        }

        return $texte;
    }
}
