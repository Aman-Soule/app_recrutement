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
        Schema::table('applications', function (Blueprint $table) {
            // Message d'erreur si le calcul du score IA a échoué (null = pas d'erreur : en attente ou terminé)
            $table->text('score_ia_erreur')->nullable()->after('score_matching_ia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn('score_ia_erreur');
        });
    }
};
