<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TalentAI — Connexion</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white font-sans antialiased">

<div class="flex min-h-screen">

    {{-- Panneau gauche --}}
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 flex-col justify-between p-12">
        <div class="flex items-center gap-2">
            <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <x-icon name="layers" class="w-5 h-5 text-white" />
            </div>
            <span class="font-bold text-white text-xl">TalentAI</span>
        </div>

        <div>
            <h1 class="text-4xl font-bold text-white leading-tight mb-4">
                Le recrutement<br>intelligent<br>pour l'ère moderne.
            </h1>
            <p class="text-blue-100 text-base leading-relaxed max-w-sm">
                Découvrez les meilleurs talents sans effort. Notre plateforme basée sur l'IA simplifie votre processus de recrutement, vous mettant en relation avec les candidats idéaux plus rapidement que jamais.
            </p>
        </div>

        <div class="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
            <div class="flex items-center gap-2 mb-3">
                <div class="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                <div class="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                <div class="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                <span class="text-white/60 text-xs ml-2">Recruitment Metric</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div class="bg-white/20 rounded-lg p-3 text-center">
                    <p class="text-white font-bold text-lg">225%</p>
                    <p class="text-white/70 text-xs">Croissance</p>
                </div>
                <div class="bg-white/20 rounded-lg p-3 text-center">
                    <p class="text-white font-bold text-lg">842</p>
                    <p class="text-white/70 text-xs">Candidats</p>
                </div>
                <div class="bg-white/20 rounded-lg p-3 text-center">
                    <p class="text-white font-bold text-lg">98%</p>
                    <p class="text-white/70 text-xs">Match IA</p>
                </div>
            </div>
        </div>
    </div>

    {{-- Panneau droit --}}
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div class="w-full max-w-md">

            <h2 class="text-3xl font-bold text-gray-900 mb-1">Bon retour</h2>
            <p class="text-gray-500 text-sm mb-8">Veuillez saisir vos informations pour vous connecter.</p>

            <form action="{{ route('login.post') }}" method="POST" class="space-y-5">
                @csrf

                @if($errors->any())
                    <div class="bg-red-50 border border-red-200 rounded-xl p-3">
                        @foreach($errors->all() as $error)
                            <p class="text-sm text-red-600">{{ $error }}</p>
                        @endforeach
                    </div>
                @endif

                @if(session('success'))
                    <div class="bg-green-50 border border-green-200 rounded-xl p-3">
                        <p class="text-sm text-green-600">{{ session('success') }}</p>
                    </div>
                @endif

                {{-- Email --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-gray-400">
                            <x-icon name="mail" class="w-4 h-4" />
                        </span>
                        <input type="email" name="email" value="{{ old('email') }}" placeholder="name@company.com"
                               class="w-full pl-10 pr-4 py-2.5 border @error('email') border-red-400 @else border-gray-200 @enderror rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    </div>
                    @error('email') <p class="text-xs text-red-500 mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Mot de passe --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-gray-400">
                            <x-icon name="lock-closed" class="w-4 h-4" />
                        </span>
                        <input type="password" name="password" placeholder="••••••••" id="pwd"
                               class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                        <button type="button" onclick="togglePwd()" id="eyeBtn" class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                            <x-icon name="eye" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" name="remember" class="w-4 h-4 rounded border-gray-300 text-blue-600">
                        Se souvenir pendant 30 jours
                    </label>
                    <a href="#" class="text-sm text-blue-600 font-medium hover:underline">Mot de passe oublié ?</a>
                </div>

                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition">
                    Se connecter
                </button>

                <p class="text-center text-sm text-gray-500">
                    Vous n'avez pas de compte ?
                    <a href="{{ route('register') }}" class="text-blue-600 font-medium hover:underline">S'inscrire</a>
                </p>
            </form>

            {{-- Séparateur --}}
            <div class="flex items-center gap-3 my-6">
                <div class="flex-1 h-px bg-gray-200"></div>
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">Ou continuer avec</span>
                <div class="flex-1 h-px bg-gray-200"></div>
            </div>

            {{-- OAuth --}}
            <div class="space-y-3">
                <a href="#" class="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    {{-- Google SVG officiel --}}
                    <svg class="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Se connecter avec Google
                </a>

                <a href="#" class="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    {{-- LinkedIn SVG officiel --}}
                    <svg class="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Se connecter avec LinkedIn
                </a>
            </div>

            <p class="text-center text-xs text-gray-400 mt-6">
                En vous connectant, vous acceptez nos
                <a href="#" class="underline hover:text-gray-600">Conditions d'utilisation</a>
                et notre
                <a href="#" class="underline hover:text-gray-600">Politique de confidentialité</a>.
            </p>

        </div>
    </div>
</div>

<script>
    function togglePwd() {
        const pwd = document.getElementById('pwd');
        pwd.type = pwd.type === 'password' ? 'text' : 'password';
    }
</script>
</body>
</html>
