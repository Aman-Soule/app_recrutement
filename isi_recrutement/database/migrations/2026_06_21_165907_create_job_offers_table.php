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
        Schema::create('job_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');            // Entreprise qui publie
            $table->foreignId('recruiter_profile_id')->constrained()->onDelete('cascade'); // Recruteur responsable
            $table->string('reference')->unique();           // Ex: SPD-2023-01
            $table->string('titre');                         // Intitulé du poste
            $table->string('departement')->nullable();       // Ex: Design & UX, Ingénierie
            $table->text('description')->nullable();         // Description complète du poste
            $table->text('exigences')->nullable();           // Profil recherché
            $table->string('localisation')->nullable();      // Ex: Paris, FR
            $table->enum('type_lieu', [
                'teletravail',
                'hybride',
                'presentiel'
            ])->default('presentiel');
            $table->enum('type_contrat', [
                'temps_plein',
                'temps_partiel',
                'freelance',
                'stage'
            ])->default('temps_plein');
            $table->string('salaire_min')->nullable();
            $table->string('salaire_max')->nullable();
            $table->enum('statut', [
                'brouillon',    // Pas encore publié
                'actif',        // Visible et accepte des candidatures
                'ferme'         // Clôturé
            ])->default('brouillon');
            $table->json('competences_requises')->nullable(); // IDs des skills nécessaires pour le matching IA
            $table->integer('nombre_candidats')->default(0); // Compteur mis à jour automatiquement
            $table->timestamp('publie_le')->nullable();       // Date de publication
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_offers');
    }
};
