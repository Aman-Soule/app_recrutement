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

    {{-- Panneau gauche bleu --}}
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 flex-col justify-between p-12">
        {{-- Logo --}}
        <div class="flex items-center gap-2">
            <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            <span class="font-bold text-white text-xl">TalentAI</span>
        </div>

        {{-- Texte hero --}}
        <div>
            <h1 class="text-4xl font-bold text-white leading-tight mb-4">
                Le recrutement<br>intelligent<br>pour l'ère moderne.
            </h1>
            <p class="text-blue-100 text-base leading-relaxed max-w-sm">
                Découvrez les meilleurs talents sans effort. Notre plateforme basée sur l'IA simplifie votre processus de recrutement, vous mettant en relation avec les candidats idéaux plus rapidement que jamais.
            </p>
        </div>

        {{-- Aperçu dashboard --}}
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

    {{-- Panneau droit formulaire --}}
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div class="w-full max-w-md">

            <h2 class="text-3xl font-bold text-gray-900 mb-1">Bon retour</h2>
            <p class="text-gray-500 text-sm mb-8">Veuillez saisir vos informations pour vous connecter.</p>

            <form action="{{ route('login.post') }}" method="POST" class="space-y-5">
                @csrf

                {{-- Afficher les erreurs --}}
                @if($errors->any())
                    <div class="bg-red-50 border border-red-200 rounded-xl p-3">
                        @foreach($errors->all() as $error)
                            <p class="text-sm text-red-600">{{ $error }}</p>
                        @endforeach
                    </div>
                @endif

                {{-- Message de succès --}}
                @if(session('success'))
                    <div class="bg-green-50 border border-green-200 rounded-xl p-3">
                        <p class="text-sm text-green-600">{{ session('success') }}</p>
                    </div>
                @endif

                {{-- Email --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
                    <div class="relative">
                        <svg class="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <input type="email" name="email" value="{{ old('email') }}" placeholder="name@company.com"
                               class="w-full pl-10 pr-4 py-2.5 border @error('email') border-red-400 @else border-gray-200 @enderror rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    </div>
                    @error('email') <p class="text-xs text-red-500 mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Mot de passe --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                    <div class="relative">
                        <svg class="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        <input type="password" name="password" placeholder="••••••••" id="pwd"
                               class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                        <button type="button" onclick="togglePwd()" class="absolute right-3 top-3 text-gray-400">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
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
