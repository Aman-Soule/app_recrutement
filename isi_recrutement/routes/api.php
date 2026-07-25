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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AiMatchScoreController;
use App\Http\Controllers\Admin\AdminCompanyController;
use App\Http\Controllers\Admin\AdminRecruiterController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminStatsController;

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
    Route::get('/user',          [AuthController::class, 'user']);
    Route::post('/logout',       [AuthController::class, 'logout']);
    Route::put('/user',          [AuthController::class, 'updateAccount']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // ---- Compétences (tous les rôles) ----
    Route::get('/competences',  [SkillController::class, 'index']);
    Route::post('/competences', [SkillController::class, 'store']);

    // ---- Offres d'emploi (lecture pour tous) ----
    Route::get('/offres',            [JobOfferController::class, 'index']);
    Route::get('/offres/{jobOffer}', [JobOfferController::class, 'show']);

    // ---- Entreprise (lecture pour tous) ----
    Route::get('/entreprises/{company}', [CompanyController::class, 'show']);

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
        Route::post('/candidat/profil/avatar',      [CandidateProfileController::class, 'uploadAvatar']);
        Route::post('/candidat/profil/cv',          [CandidateProfileController::class, 'uploadCv']);

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
        Route::get('/recruteur/profil',        [RecruiterProfileController::class, 'show']);
        Route::put('/recruteur/profil',        [RecruiterProfileController::class, 'update']);
        Route::post('/recruteur/profil/avatar', [RecruiterProfileController::class, 'uploadAvatar']);

        // Vue d'ensemble recruteur (agrégats sur toutes ses offres)
        Route::get('/recruteur/candidatures', [ApplicationController::class, 'pourRecruteur']);
        Route::get('/recruteur/candidats',    [CandidateProfileController::class, 'pourRecruteur']);
        Route::get('/recruteur/candidats/{candidateProfile}', [CandidateProfileController::class, 'voir']);

        // Entreprise
        Route::post('/entreprises',              [CompanyController::class, 'store']);
        Route::put('/entreprises/{company}',     [CompanyController::class, 'update']);
        Route::post('/entreprises/{company}/logo', [CompanyController::class, 'uploadLogo']);

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
    | Routes Administrateur uniquement
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {

        // Entreprises (CRUD complet)
        Route::get('/admin/entreprises',              [AdminCompanyController::class, 'index']);
        Route::post('/admin/entreprises',              [AdminCompanyController::class, 'store']);
        Route::get('/admin/entreprises/{company}',    [AdminCompanyController::class, 'show']);
        Route::put('/admin/entreprises/{company}',    [AdminCompanyController::class, 'update']);
        Route::delete('/admin/entreprises/{company}', [AdminCompanyController::class, 'destroy']);

        // Recruteurs
        Route::get('/admin/recruteurs',        [AdminRecruiterController::class, 'index']);
        Route::post('/admin/recruteurs',       [AdminRecruiterController::class, 'store']);
        Route::get('/admin/recruteurs/{user}', [AdminRecruiterController::class, 'show']);
        Route::put('/admin/recruteurs/{user}', [AdminRecruiterController::class, 'update']);

        // Utilisateurs (tous rôles)
        Route::get('/admin/utilisateurs',        [AdminUserController::class, 'index']);
        Route::get('/admin/utilisateurs/{user}', [AdminUserController::class, 'show']);
        Route::put('/admin/utilisateurs/{user}', [AdminUserController::class, 'update']);

        // Statistiques
        Route::get('/admin/stats', [AdminStatsController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | Messages (candidat ET recruteur)
    |--------------------------------------------------------------------------
    */
    Route::post('/messages',                      [MessageController::class, 'store']);
    Route::get('/messages/non-lus',               [MessageController::class, 'nonLus']);
    Route::get('/messages/conversations',         [MessageController::class, 'conversations']);
    Route::get('/messages/conversation/{userId}', [MessageController::class, 'conversation']);

    /*
    |--------------------------------------------------------------------------
    | Notifications (candidat ET recruteur)
    |--------------------------------------------------------------------------
    */
    Route::get('/notifications',            [NotificationController::class, 'index']);
    Route::get('/notifications/non-lues',   [NotificationController::class, 'nonLues']);
    Route::put('/notifications/{id}/lu',    [NotificationController::class, 'marquerLu']);
    Route::put('/notifications/lu-tout',    [NotificationController::class, 'marquerToutLu']);
});
