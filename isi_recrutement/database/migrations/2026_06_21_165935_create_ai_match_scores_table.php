<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_match_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_profile_id')->constrained()->onDelete('cascade'); // Candidat évalué
            $table->foreignId('job_offer_id')->constrained()->onDelete('cascade');         // Offre comparée
            $table->integer('score_global');                  // Score global de correspondance 0-100
            $table->integer('score_competences')->nullable(); // Sous-score : compétences techniques
            $table->integer('score_experience')->nullable();  // Sous-score : années d'expérience
            $table->integer('score_localisation')->nullable(); // Sous-score : compatibilité géographique
            $table->integer('score_salaire')->nullable();     // Sous-score : compatibilité salariale
            $table->json('competences_matchees')->nullable(); // Liste des compétences qui correspondent
            $table->json('competences_manquantes')->nullable(); // Liste des compétences absentes
            $table->timestamp('calcule_le')->useCurrent();   // Date du dernier calcul IA
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_match_scores');
    }
};
