<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\JobOffer;
use App\Models\RecruiterProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class JobOfferSeeder extends Seeder
{
    /**
     * Crée quelques entreprises, un recruteur par entreprise, et des offres
     * actives pour que la page visiteur ait des données à afficher.
     */
    public function run(): void
    {
        $entreprises = [
            [
                'nom' => 'NovaTech',
                'secteur' => 'Technologies & Logiciels',
                'description' => "NovaTech conçoit des solutions cloud pour les entreprises en croissance.",
                'taille' => 'pme',
                'localisation' => 'Paris, FR',
                'site_web' => 'https://novatech.example.com',
            ],
            [
                'nom' => 'GreenLoop',
                'secteur' => 'Énergie & Environnement',
                'description' => "GreenLoop développe des outils de pilotage énergétique pour les collectivités.",
                'taille' => 'startup',
                'localisation' => 'Lyon, FR',
                'site_web' => 'https://greenloop.example.com',
            ],
            [
                'nom' => 'Atlas Finance',
                'secteur' => 'Finance & Assurance',
                'description' => "Atlas Finance accompagne les PME dans la gestion de leur trésorerie.",
                'taille' => 'grand_groupe',
                'localisation' => 'Dakar, SN',
                'site_web' => 'https://atlasfinance.example.com',
            ],
        ];

        $offresParEntreprise = [
            'NovaTech' => [
                ['titre' => 'Développeur Full Stack Angular/Laravel', 'departement' => 'Ingénierie', 'type_lieu' => 'hybride', 'type_contrat' => 'temps_plein', 'salaire_min' => '38000', 'salaire_max' => '48000'],
                ['titre' => 'Ingénieur DevOps', 'departement' => 'Infrastructure', 'type_lieu' => 'teletravail', 'type_contrat' => 'temps_plein', 'salaire_min' => '42000', 'salaire_max' => '52000'],
                ['titre' => 'Stagiaire Développement Frontend', 'departement' => 'Ingénierie', 'type_lieu' => 'presentiel', 'type_contrat' => 'stage', 'salaire_min' => null, 'salaire_max' => null],
            ],
            'GreenLoop' => [
                ['titre' => 'Data Analyst Énergie', 'departement' => 'Data', 'type_lieu' => 'hybride', 'type_contrat' => 'temps_plein', 'salaire_min' => '35000', 'salaire_max' => '44000'],
                ['titre' => 'Chargé(e) de projet environnemental', 'departement' => 'Opérations', 'type_lieu' => 'presentiel', 'type_contrat' => 'temps_plein', 'salaire_min' => '32000', 'salaire_max' => '39000'],
            ],
            'Atlas Finance' => [
                ['titre' => 'Analyste Financier Junior', 'departement' => 'Finance', 'type_lieu' => 'presentiel', 'type_contrat' => 'temps_plein', 'salaire_min' => '3000', 'salaire_max' => '4500'],
                ['titre' => 'Comptable freelance', 'departement' => 'Finance', 'type_lieu' => 'teletravail', 'type_contrat' => 'freelance', 'salaire_min' => null, 'salaire_max' => null],
                ['titre' => 'Responsable Recouvrement', 'departement' => 'Finance', 'type_lieu' => 'presentiel', 'type_contrat' => 'temps_plein', 'salaire_min' => '3500', 'salaire_max' => '5000'],
            ],
        ];

        foreach ($entreprises as $donneesEntreprise) {
            $entreprise = Company::firstOrCreate(
                ['nom' => $donneesEntreprise['nom']],
                $donneesEntreprise,
            );

            // Un compte recruteur associé à l'entreprise (mot de passe : password)
            $email = Str::slug($entreprise->nom) . '@example.com';
            $utilisateur = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => 'Recruteur ' . $entreprise->nom,
                    'password' => Hash::make('password'),
                    'role' => 'recruiter',
                ],
            );

            $recruteur = RecruiterProfile::firstOrCreate(
                ['user_id' => $utilisateur->id],
                [
                    'company_id' => $entreprise->id,
                    'titre' => 'Talent Acquisition',
                    'forfait' => 'pro',
                ],
            );

            foreach ($offresParEntreprise[$entreprise->nom] ?? [] as $offre) {
                JobOffer::firstOrCreate(
                    ['titre' => $offre['titre'], 'company_id' => $entreprise->id],
                    [
                        'recruiter_profile_id' => $recruteur->id,
                        'reference' => 'REF-' . strtoupper(Str::random(8)),
                        'departement' => $offre['departement'],
                        'description' => "Rejoignez {$entreprise->nom} en tant que {$offre['titre']}. "
                            . "Vous travaillerez au sein d'une équipe dynamique sur des projets à fort impact.",
                        'exigences' => "Expérience pertinente sur un poste similaire, esprit d'équipe et autonomie.",
                        'localisation' => $entreprise->localisation,
                        'type_lieu' => $offre['type_lieu'],
                        'type_contrat' => $offre['type_contrat'],
                        'salaire_min' => $offre['salaire_min'],
                        'salaire_max' => $offre['salaire_max'],
                        'statut' => 'actif',
                        'nombre_candidats' => 0,
                        'publie_le' => now(),
                    ],
                );
            }
        }
    }
}
