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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expediteur_id')->constrained('users')->onDelete('cascade');  // Qui envoie
            $table->foreignId('destinataire_id')->constrained('users')->onDelete('cascade'); // Qui reçoit
            $table->foreignId('application_id')->nullable()->constrained()->onDelete('set null'); // Lié à une candidature (optionnel)
            $table->text('contenu');                         // Contenu du message
            $table->boolean('lu')->default(false);           // Message lu ou non
            $table->timestamp('lu_le')->nullable();          // Date de lecture
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
