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
        Schema::table('ai_match_scores', function (Blueprint $table) {
            $table->text('resume_ia')->nullable()->after('competences_manquantes'); // Résumé généré par l'IA
            $table->enum('source', ['ia', 'heuristique'])->default('ia')->after('resume_ia'); // Vrai scan Gemini ou repli sans IA
            $table->unique(['candidate_profile_id', 'job_offer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_match_scores', function (Blueprint $table) {
            $table->dropUnique(['candidate_profile_id', 'job_offer_id']);
            $table->dropColumn(['resume_ia', 'source']);
        });
    }
};
