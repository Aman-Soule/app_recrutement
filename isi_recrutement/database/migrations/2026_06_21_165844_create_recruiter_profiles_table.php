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
        Schema::create('recruiter_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');    // Lié à l'utilisateur
            $table->foreignId('company_id')->nullable()->constrained()->onDelete('set null'); // Entreprise du recruteur
            $table->string('titre')->nullable();             // Ex: Senior Recruiter
            $table->string('avatar_url')->nullable();
            $table->string('telephone')->nullable();
            $table->enum('forfait', [
                'gratuit',
                'pro',
                'entreprise'
            ])->default('gratuit');                          // Plan d'abonnement
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recruiter_profiles');
    }
};
