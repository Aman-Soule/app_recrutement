<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CandidateProfileController;
use App\Http\Controllers\RecruiterProfileController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\JobOfferController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AiMatchScoreController;

/*
|--------------------------------------------------------------------------
| Test de connexion
|--------------------------------------------------------------------------
*/
Route::get('/ping', function () {
    return response()->json(['message' => 'Connexion OK !']);
});

/*
|--------------------------------------------------------------------------
| Authentification (routes publiques)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Routes protégées par Sanctum
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ---- Authentification ----
    Route::get('/user',    [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ---- Compétences (tous les rôles) ----
    Route::get('/competences',  [SkillController::class, 'index']);
    Route::post('/competences', [SkillController::class, 'store']);

    // ---- Offres d'emploi (lecture pour tous) ----
    Route::get('/offres',            [JobOfferController::class, 'index']);
    Route::get('/offres/{jobOffer}', [JobOfferController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | Routes Candidat uniquement
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:candidate')->group(function () {

        // Profil candidat
        Route::get('/candidat/profil',              [CandidateProfileController::class, 'show']);
        Route::put('/candidat/profil',              [CandidateProfileController::class, 'update']);
        Route::post('/candidat/profil/competences', [CandidateProfileController::class, 'syncCompetences']);

        // Candidatures
        Route::get('/candidat/candidatures',        [ApplicationController::class, 'mesCandidatures']);
        Route::post('/offres/{jobOffer}/postuler',  [ApplicationController::class, 'store']);

        // Matching IA
        Route::get('/candidat/offres-recommandees', [JobOfferController::class, 'recommandees']);
        Route::post('/offres/{jobOffer}/matching',  [AiMatchScoreController::class, 'calculer']);
    });

    /*
    |--------------------------------------------------------------------------
    | Routes Recruteur uniquement
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:recruiter')->group(function () {

        // Profil recruteur
        Route::get('/recruteur/profil', [RecruiterProfileController::class, 'show']);
        Route::put('/recruteur/profil', [RecruiterProfileController::class, 'update']);

        // Entreprise
        Route::post('/entreprises',          [CompanyController::class, 'store']);
        Route::get('/entreprises/{company}', [CompanyController::class, 'show']);
        Route::put('/entreprises/{company}', [CompanyController::class, 'update']);

        // Offres d'emploi
        Route::post('/offres',              [JobOfferController::class, 'store']);
        Route::put('/offres/{jobOffer}',    [JobOfferController::class, 'update']);
        Route::delete('/offres/{jobOffer}', [JobOfferController::class, 'destroy']);

        // Candidatures
        Route::get('/offres/{jobOffer}/candidatures',    [ApplicationController::class, 'parOffre']);
        Route::put('/candidatures/{application}/statut', [ApplicationController::class, 'changerStatut']);

        // Entretiens
        Route::get('/entretiens',                               [InterviewController::class, 'index']);
        Route::post('/candidatures/{application}/entretiens',   [InterviewController::class, 'store']);
        Route::put('/entretiens/{interview}/feedback',          [InterviewController::class, 'feedback']);

        // Matching IA recruteur
        Route::get('/offres/{jobOffer}/meilleurs-candidats', [AiMatchScoreController::class, 'meilleursCandidats']);
    });

    /*
    |--------------------------------------------------------------------------
    | Messages (candidat ET recruteur)
    |--------------------------------------------------------------------------
    */
    Route::post('/messages',                      [MessageController::class, 'store']);
    Route::get('/messages/non-lus',               [MessageController::class, 'nonLus']);
    Route::get('/messages/conversation/{userId}', [MessageController::class, 'conversation']);
});
