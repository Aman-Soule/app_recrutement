@extends('layouts.app')

@section('title', 'Dashboard Candidat')
@section('search_placeholder', 'Rechercher des offres...')
@section('nav_section', 'PORTAIL CANDIDAT')

@section('sidebar_nav')
    <a href="{{ route('candidat.dashboard') }}" class="nav-item active">
        <x-icon name="home" class="w-4 h-4" /> Tableau de bord
    </a>
    <a href="#" class="nav-item">
        <x-icon name="search" class="w-4 h-4" /> Trouver des offres
    </a>
    <a href="#" class="nav-item">
        <x-icon name="document" class="w-4 h-4" /> Mes candidatures
    </a>
    <a href="#" class="nav-item">
        <x-icon name="user" class="w-4 h-4" /> Profil
    </a>
    <a href="#" class="nav-item">
        <x-icon name="chat" class="w-4 h-4" /> Messages
    </a>
    <a href="#" class="nav-item">
        <x-icon name="star" class="w-4 h-4" /> Évaluation des compétences
    </a>

    {{-- Bannière Premium --}}
    <div class="mx-1 mt-6 p-3 bg-blue-600 rounded-xl text-white">
        <p class="text-xs font-bold mb-1">Évolution de carrière</p>
        <p class="text-xs text-blue-100 mb-3">Débloquez des offres premium et des aperçus de salaires.</p>
        <button class="w-full bg-white text-blue-600 text-xs font-bold py-1.5 rounded-lg">
            Passer au Premium
        </button>
    </div>
@endsection

@section('content')

    {{-- En-tête --}}
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Bon retour, {{ Auth::user()->name }} !</h1>
        <div class="flex items-center gap-3">
            <span class="flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                <span class="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                À l'écoute d'opportunités
            </span>
        </div>
    </div>

    {{-- LIGNE 1 : Force du profil + Statut candidatures --}}
    <div class="grid grid-cols-2 gap-5 mb-6">

        {{-- Force du profil --}}
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-1">
                <h2 class="font-bold text-gray-900">Force du profil</h2>
                <span class="text-blue-600 font-bold text-lg">85%</span>
            </div>
            <p class="text-xs text-gray-400 mb-3">Boostez votre visibilité auprès des recruteurs</p>
            <div class="h-2 bg-gray-100 rounded-full mb-4">
                <div class="h-2 bg-blue-600 rounded-full" style="width: 85%"></div>
            </div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Compétences clés vérifiées</p>
            <div class="flex gap-2 flex-wrap mb-4">
                <span class="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    <x-icon name="star" class="w-3 h-3" /> UI Design
                </span>
                <span class="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    <x-icon name="star" class="w-3 h-3" /> React.js
                </span>
                <span class="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    <x-icon name="star" class="w-3 h-3" /> Figma
                </span>
            </div>
            <button class="w-full border border-blue-600 text-blue-600 text-sm font-semibold py-2 rounded-xl hover:bg-blue-50 transition">
                Complétez votre profil
            </button>
        </div>

        {{-- Statut candidatures actives --}}
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 class="font-bold text-gray-900 mb-4">Statut des candidatures actives</h2>

            <div class="flex items-center gap-3 mb-5">
                <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <x-icon name="briefcase" class="w-5 h-5 text-green-600" />
                </div>
                <div class="flex-1">
                    <p class="font-semibold text-gray-900 text-sm">Senior Product Designer</p>
                    <p class="text-xs text-gray-400">Google • Mountain View (Télétravail)</p>
                </div>
                <span class="text-xs text-blue-600 font-semibold">En cours</span>
            </div>

            <div class="relative mb-4">
                <div class="flex items-center justify-between relative">
                    <div class="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0"></div>
                    <div class="absolute top-4 left-4 w-1/2 h-0.5 bg-blue-600 z-0"></div>

                    @foreach([
                        ['label' => 'POSTULÉ',   'done' => true],
                        ['label' => 'EXAMEN',    'done' => true],
                        ['label' => 'ENTRETIEN', 'done' => true, 'active' => true],
                        ['label' => 'OFFRE',     'done' => false],
                    ] as $etape)
                        <div class="flex flex-col items-center z-10">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                {{ $etape['done'] ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400' }}
                                {{ isset($etape['active']) ? 'ring-4 ring-blue-100' : '' }}">
                                @if($etape['done'])
                                    <x-icon name="star" class="w-3.5 h-3.5" />
                                @else
                                    <x-icon name="document" class="w-3.5 h-3.5" />
                                @endif
                            </div>
                            <p class="text-xs text-gray-400 mt-1 font-medium">{{ $etape['label'] }}</p>
                        </div>
                    @endforeach
                </div>
            </div>

            <div class="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2">
                <div class="flex items-center gap-2">
                    <x-icon name="bell" class="w-4 h-4 text-blue-500" />
                    <p class="text-xs text-gray-600">
                        Votre entretien technique est prévu pour
                        <span class="font-bold text-gray-900">demain à 10h00</span>
                    </p>
                </div>
                <a href="#" class="text-xs text-blue-600 font-semibold whitespace-nowrap ml-2">Ajouter au calendrier</a>
            </div>
        </div>
    </div>

    {{-- LIGNE 2 : Recommandé pour vous --}}
    <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
            <div>
                <h2 class="font-bold text-gray-900 text-lg">Recommandé pour vous</h2>
                <p class="text-xs text-gray-400">Basé sur vos compétences et l'algorithme TalentAI</p>
            </div>
            <a href="#" class="text-sm text-blue-600 font-semibold hover:underline">Voir toutes les recommandations</a>
        </div>

        <div class="grid grid-cols-3 gap-4">
            @foreach([
                ['titre' => 'Lead UX Researcher',    'entreprise' => 'Spotify', 'lieu' => 'Stockholm, SE (Télétravail)', 'match' => 98, 'contrat' => 'Temps plein', 'salaire' => '$120k - $160k', 'skills' => 'Research Methods & Design Systems', 'color' => 'bg-green-900'],
                ['titre' => 'Senior Product Designer','entreprise' => 'Airbnb',  'lieu' => 'San Francisco, US',           'match' => 94, 'contrat' => 'Hybride',     'salaire' => '$140k - $190k', 'skills' => 'Figma Mastery & Visual Design',    'color' => 'bg-red-500'],
                ['titre' => 'UX Engineer',            'entreprise' => 'Stripe',  'lieu' => 'Dublin, IE (Télétravail)',    'match' => 91, 'contrat' => 'Temps plein', 'salaire' => '$110k - $150k', 'skills' => 'React.js & Prototyping',           'color' => 'bg-blue-600'],
            ] as $offre)
                <div class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col">
                    <div class="flex items-start justify-between mb-3">
                        <div class="w-10 h-10 {{ $offre['color'] }} rounded-xl"></div>
                        <div class="text-right">
                            <p class="text-green-500 font-bold text-sm">Match {{ $offre['match'] }}%</p>
                            <p class="text-xs text-gray-400">Score IA</p>
                        </div>
                    </div>
                    <h3 class="font-bold text-gray-900 text-sm mb-0.5">{{ $offre['titre'] }}</h3>
                    <p class="text-xs text-gray-400 mb-3">{{ $offre['entreprise'] }} • {{ $offre['lieu'] }}</p>
                    <div class="flex gap-2 mb-2 flex-wrap">
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ $offre['contrat'] }}</span>
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ $offre['salaire'] }}</span>
                    </div>
                    <p class="text-xs text-gray-400 mb-4 flex-1">
                        Correspond à vos compétences <span class="font-bold text-gray-700">{{ $offre['skills'] }}</span>
                    </p>
                    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition">
                        Postuler avec TalentAI
                    </button>
                </div>
            @endforeach
        </div>
    </div>

    {{-- LIGNE 3 : Messages + Tendance employabilité --}}
    <div class="grid grid-cols-2 gap-5">

        {{-- Messages récents --}}
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="font-bold text-gray-900">Messages récents</h2>
                <span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2 Nouveaux</span>
            </div>

            @foreach([
                ['nom' => 'Sarah Jenkins (Google)', 'temps' => 'Il y a 10m', 'msg' => 'L\'équipe a été impressionnée par votre portfolio...', 'avatar' => '47'],
                ['nom' => 'Marsk Wilson (Stripe)',  'temps' => 'Il y a 2h',  'msg' => 'Merci pour les résultats de l\'évaluation. Parlons...', 'avatar' => '32'],
            ] as $message)
                <div class="flex items-start gap-3 mb-4">
                    <img src="https://i.pravatar.cc/36?img={{ $message['avatar'] }}" class="w-9 h-9 rounded-full object-cover">
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-semibold text-gray-900">{{ $message['nom'] }}</p>
                            <p class="text-xs text-gray-400">{{ $message['temps'] }}</p>
                        </div>
                        <p class="text-xs text-gray-500 mt-0.5">{{ $message['msg'] }}</p>
                    </div>
                </div>
            @endforeach

            <button class="w-full border border-gray-200 text-blue-600 text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition">
                Ouvrir la boîte de réception
            </button>
        </div>

        {{-- Tendance employabilité --}}
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="font-bold text-gray-900">Tendance de votre employabilité</h2>
                <span class="text-green-500 font-semibold text-sm">+12% ce mois-ci</span>
            </div>
            <svg viewBox="0 0 400 120" class="w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#2563EB" stop-opacity="0.15"/>
                        <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <path d="M0,90 C50,85 80,70 120,65 C160,60 200,55 240,45 C280,35 320,25 400,20 L400,120 L0,120 Z" fill="url(#grad)"/>
                <path d="M0,90 C50,85 80,70 120,65 C160,60 200,55 240,45 C280,35 320,25 400,20" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <div class="flex justify-between mt-2 px-1">
                @foreach(['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin'] as $mois)
                    <span class="text-xs text-gray-400">{{ $mois }}</span>
                @endforeach
            </div>
            <p class="text-xs text-gray-400 mt-2 text-center">Calculé selon les apparitions dans les recherches et le taux de correspondance des compétences.</p>
        </div>
    </div>

@endsection
