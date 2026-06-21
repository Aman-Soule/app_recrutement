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
        Schema::create('candidate_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_profile_id')->constrained()->onDelete('cascade'); // Profil candidat
            $table->foreignId('skill_id')->constrained()->onDelete('cascade');             // Compétence
            $table->enum('niveau', [
                'debutant',
                'intermediaire',
                'avance',
                'expert'
            ])->default('intermediaire');
            $table->boolean('verifie')->default(false);      // Badge de vérification IA
            $table->integer('score_verification')->nullable(); // Score obtenu lors du test IA 0-100
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidate_skills');
    }
};
