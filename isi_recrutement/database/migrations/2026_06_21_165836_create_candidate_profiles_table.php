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
        Schema::create('candidate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Lié à l'utilisateur
            $table->string('titre')->nullable();             // Ex: Senior UX Designer
            $table->text('biographie')->nullable();          // Présentation personnelle
            $table->string('localisation')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('cv_url')->nullable();            // Fichier CV uploadé
            $table->string('portfolio_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->integer('annees_experience')->default(0);
            $table->integer('force_profil')->default(0);     // Score complétude profil 0-100%
            $table->integer('score_employabilite')->default(0); // Tendance calculée par l'IA
            $table->enum('disponibilite', [
                'disponible',       // Cherche activement
                'a_lecoute',        // Ouvert aux opportunités
                'non_disponible'    // Pas en recherche
            ])->default('a_lecoute');
            $table->string('salaire_min_souhaite')->nullable();
            $table->string('salaire_max_souhaite')->nullable();
            $table->enum('type_contrat_souhaite', [
                'temps_plein',
                'temps_partiel',
                'freelance',
                'stage'
            ])->nullable();
            $table->enum('type_lieu_souhaite', [
                'teletravail',
                'hybride',
                'presentiel'
            ])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidate_profiles');
    }
};
