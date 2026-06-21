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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_profile_id')->constrained()->onDelete('cascade'); // Candidat
            $table->foreignId('job_offer_id')->constrained()->onDelete('cascade');         // Offre visée
            $table->enum('statut', [
                'nouveau',          // Candidature reçue, pas encore traitée
                'preselection',     // Candidat retenu pour la suite
                'examen',           // En cours de test/évaluation
                'entretien',        // Entretien planifié ou passé
                'offre_envoyee',    // Offre d'emploi proposée
                'rejete',           // Candidature refusée
                'embauche'          // Candidat recruté
            ])->default('nouveau');
            $table->integer('score_matching_ia')->nullable(); // Score IA de correspondance 0-100
            $table->text('lettre_motivation')->nullable();
            $table->string('cv_url')->nullable();             // CV spécifique à cette candidature
            $table->text('notes_recruteur')->nullable();      // Notes internes du recruteur
            $table->timestamp('postule_le')->useCurrent();    // Date de candidature
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
