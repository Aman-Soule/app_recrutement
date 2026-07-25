<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CandidateProfile;
use App\Models\RecruiterProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthWebController extends Controller
{
    /** Afficher le formulaire de connexion */
    public function showLogin()
    {
        return view('auth.login');
    }

    /** Traiter la connexion */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user || !\Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'email' => 'Email ou mot de passe incorrect.'
            ])->withInput($request->only('email'));
        }

        \Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        if ($user->role === 'candidate') {
            return redirect()->to('/candidat/dashboard');
        }

        if ($user->role === 'recruiter') {
            return redirect()->to('/recruteur/dashboard');
        }

        return redirect()->to('/');
    }
    /** Afficher le formulaire d'inscription */
    public function showRegister()
    {
        return view('auth.register');
    }

    /** Traiter l'inscription */
    public function register(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
        ], [
            'name.required'         => 'Le nom est obligatoire.',
            'email.required'        => 'L\'adresse e-mail est obligatoire.',
            'email.unique'          => 'Cet e-mail est déjà utilisé.',
            'password.required'     => 'Le mot de passe est obligatoire.',
            'password.min'          => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed'    => 'Les mots de passe ne correspondent pas.',
        ]);

        // Inscription publique : toujours candidat. Les comptes recruteur/admin
        // sont créés uniquement par un administrateur.
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'candidate',
        ]);

        CandidateProfile::create(['user_id' => $user->id]);

        // Connecter automatiquement
        Auth::login($user);
        $request->session()->regenerate();

        // Redirection selon le rôle
        return match($user->role) {
            'recruiter' => redirect()->route('recruteur.dashboard')->with('success', 'Bienvenue sur TalentAI !'),
            'candidate' => redirect()->route('candidat.dashboard')->with('success', 'Bienvenue sur TalentAI !'),
            default     => redirect('/'),
        };
    }

    /** Déconnexion */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
