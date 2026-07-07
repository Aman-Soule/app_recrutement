<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $competences = [
            ['nom' => 'JavaScript', 'categorie' => 'Développement'],
            ['nom' => 'TypeScript', 'categorie' => 'Développement'],
            ['nom' => 'PHP', 'categorie' => 'Développement'],
            ['nom' => 'Laravel', 'categorie' => 'Développement'],
            ['nom' => 'Angular', 'categorie' => 'Développement'],
            ['nom' => 'React', 'categorie' => 'Développement'],
            ['nom' => 'Node.js', 'categorie' => 'Développement'],
            ['nom' => 'Python', 'categorie' => 'Développement'],
            ['nom' => 'Java', 'categorie' => 'Développement'],
            ['nom' => 'SQL', 'categorie' => 'Données'],
            ['nom' => 'Docker', 'categorie' => 'DevOps'],
            ['nom' => 'Git', 'categorie' => 'DevOps'],
            ['nom' => 'AWS', 'categorie' => 'DevOps'],
            ['nom' => 'UI Design', 'categorie' => 'Design'],
            ['nom' => 'Figma', 'categorie' => 'Design'],
            ['nom' => 'UX Research', 'categorie' => 'Design'],
            ['nom' => 'Gestion de projet', 'categorie' => 'Management'],
            ['nom' => 'Communication', 'categorie' => 'Soft skills'],
            ['nom' => 'Anglais courant', 'categorie' => 'Langues'],
            ['nom' => 'Recrutement', 'categorie' => 'RH'],
        ];

        foreach ($competences as $competence) {
            Skill::firstOrCreate(['nom' => $competence['nom']], $competence);
        }
    }
}
