<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TalentAI — Inscription</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white font-sans antialiased">

<div class="flex min-h-screen">

    {{-- Panneau gauche --}}
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 flex-col justify-between p-12">
        <div class="flex items-center gap-2">
            <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            <span class="font-bold text-white text-xl">TalentAI</span>
        </div>
        <div>
            <h1 class="text-4xl font-bold text-white leading-tight mb-4">
                Rejoignez la<br>plateforme de<br>recrutement IA.
            </h1>
            <p class="text-blue-100 text-base leading-relaxed max-w-sm">
                Créez votre compte et accédez à des milliers d'opportunités ou trouvez les meilleurs talents grâce à notre algorithme de matching intelligent.
            </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/15 rounded-xl p-4">
                <p class="text-white font-bold text-2xl">10k+</p>
                <p class="text-white/70 text-sm">Candidats actifs</p>
            </div>
            <div class="bg-white/15 rounded-xl p-4">
                <p class="text-white font-bold text-2xl">500+</p>
                <p class="text-white/70 text-sm">Entreprises</p>
            </div>
        </div>
    </div>

    {{-- Formulaire --}}
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div class="w-full max-w-md">

            <h2 class="text-3xl font-bold text-gray-900 mb-1">Créer un compte</h2>
            <p class="text-gray-500 text-sm mb-6">Rejoignez TalentAI en quelques secondes.</p>

            <form action="{{ route('register.post') }}" method="POST" class="space-y-4">
                @csrf

                @if($errors->any())
                    <div class="bg-red-50 border border-red-200 rounded-xl p-3">
                        @foreach($errors->all() as $error)
                            <p class="text-sm text-red-600">{{ $error }}</p>
                        @endforeach
                    </div>
                @endif

                {{-- Nom --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                    <input type="text" name="name" value="{{ old('name') }}" placeholder="Alex Dupont"
                           class="w-full px-4 py-2.5 border @error('name') border-red-400 @else border-gray-200 @enderror rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    @error('name') <p class="text-xs text-red-500 mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Email --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
                    <input type="email" name="email" value="{{ old('email') }}" placeholder="name@company.com"
                           class="w-full px-4 py-2.5 border @error('email') border-red-400 @else border-gray-200 @enderror rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    @error('email') <p class="text-xs text-red-500 mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Rôle --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Je suis</label>
                    <div class="grid grid-cols-2 gap-3">
                        <label class="cursor-pointer">
                            <input type="radio" name="role" value="candidate" class="hidden peer" {{ old('role', 'candidate') === 'candidate' ? 'checked' : '' }}>
                            <div class="border-2 border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-50 rounded-xl p-3 text-center transition">
                                <span class="text-2xl">🎓</span>
                                <p class="text-sm font-semibold text-gray-700 mt-1">Candidat</p>
                                <p class="text-xs text-gray-400">Je cherche un emploi</p>
                            </div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="role" value="recruiter" class="hidden peer" {{ old('role') === 'recruiter' ? 'checked' : '' }}>
                            <div class="border-2 border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-50 rounded-xl p-3 text-center transition">
                                <span class="text-2xl">🏢</span>
                                <p class="text-sm font-semibold text-gray-700 mt-1">Recruteur</p>
                                <p class="text-xs text-gray-400">Je recrute des talents</p>
                            </div>
                        </label>
                    </div>
                    @error('role') <p class="text-xs text-red-500 mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Mot de passe --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                    <input type="password" name="password" placeholder="••••••••"
                           class="w-full px-4 py-2.5 border @error('password') border-red-400 @else border-gray-200 @enderror rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                    @error('password') <p class="text-xs text-red-500 mt-1">{{ $message }}</p> @enderror
                </div>

                {{-- Confirmation --}}
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                    <input type="password" name="password_confirmation" placeholder="••••••••"
                           class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition">
                </div>

                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition">
                    Créer mon compte
                </button>

                <p class="text-center text-sm text-gray-500">
                    Déjà un compte ?
                    <a href="{{ route('login') }}" class="text-blue-600 font-medium hover:underline">Se connecter</a>
                </p>
            </form>
        </div>
    </div>
</div>

</body>
</html>
