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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');        // Candidature concernée
            $table->foreignId('recruiter_profile_id')->constrained()->onDelete('cascade'); // Recruteur qui mène l'entretien
            $table->enum('type', [
                'video',        // Entretien en visioconférence
                'physique',     // Entretien en présentiel
                'telephonique'  // Entretien par téléphone
            ])->default('video');
            $table->enum('etape', [
                'rh',           // Entretien RH / premier contact
                'technique',    // Test technique
                'culturel',     // Fit culturel
                'final'         // Entretien final
            ])->default('rh');
            $table->dateTime('planifie_le');                 // Date et heure de l'entretien
            $table->integer('duree_minutes')->default(60);   // Durée prévue en minutes
            $table->string('lieu_ou_lien')->nullable();      // Lien Google Meet / adresse physique
            $table->string('plateforme')->nullable();         // Google Meet, Teams, Zoom, etc.
            $table->enum('statut', [
                'en_attente',   // Pas encore confirmé
                'confirme',     // Confirmé par les deux parties
                'termine',      // Entretien passé
                'annule'        // Annulé
            ])->default('en_attente');
            $table->text('notes_preparation')->nullable();   // Brief de préparation pour le recruteur
            $table->integer('note')->nullable();              // Note post-entretien 1 à 5
            $table->text('feedback')->nullable();             // Retour détaillé après l'entretien
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
