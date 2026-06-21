<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthWebController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\TestController;

// Auth — SANS middleware guest pour l'instant
Route::get('/',          [AuthWebController::class, 'showLogin'])->name('login');
Route::get('/login',     [AuthWebController::class, 'showLogin'])->name('login.show');
Route::post('/login',    [AuthWebController::class, 'login'])->name('login.post');
Route::get('/register',  [AuthWebController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthWebController::class, 'register'])->name('register.post');
Route::post('/logout',   [AuthWebController::class, 'logout'])->name('logout');

// Candidat — SANS middleware pour tester
Route::prefix('candidat')->name('candidat.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'candidatDashboard'])->name('dashboard');
});

// Recruteur — SANS middleware pour tester
Route::prefix('recruteur')->name('recruteur.')->group(function () {
    Route::get('/dashboard',  [DashboardController::class, 'recruteurDashboard'])->name('dashboard');
    Route::get('/offres',     [DashboardController::class, 'offres'])->name('offres');
    Route::get('/candidats',  [DashboardController::class, 'candidats'])->name('candidats');
    Route::get('/entretiens', [DashboardController::class, 'entretiens'])->name('entretiens');
    Route::get('/parametres', [DashboardController::class, 'parametres'])->name('parametres');
});

Route::get('/test/db', [TestController::class, 'index'])->name('test.db');
