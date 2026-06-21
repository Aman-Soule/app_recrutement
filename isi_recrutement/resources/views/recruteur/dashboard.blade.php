@extends('layouts.app')

@section('title', 'Dashboard Recruteur')
@section('search_placeholder', 'Rechercher des candidats, offres ou rapports...')
@section('user_name', 'Sarah Jenkins')
@section('user_role', 'Senior Recruiter')

@section('sidebar_nav')
    <a href="{{ route('recruteur.dashboard') }}" class="nav-item active">📊 Tableau de bord</a>
    <a href="{{ route('recruteur.offres') }}" class="nav-item">💼 Offres d'emploi</a>
    <a href="{{ route('recruteur.candidats') }}" class="nav-item">👥 Candidats</a>
    <a href="{{ route('recruteur.entretiens') }}" class="nav-item">📅 Entretiens</a>
    <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mt-4 mb-2">APERÇUS</p>
    <a href="#" class="nav-item">📈 Analyses</a>
    <a href="{{ route('recruteur.parametres') }}" class="nav-item">⚙️ Paramètres</a>
@endsection

@section('content')

    {{-- En-tête --}}
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Tableau de bord Recruteur</h1>
            <p class="text-gray-400 text-sm">Bonjour Sarah. Voici l'activité du jour.</p>
        </div>
        <a href="{{ route('recruteur.offres') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2">
            + Nouvelle offre
        </a>
    </div>

    {{-- Stats --}}
    <div class="grid grid-cols-4 gap-4 mb-6">
        @foreach([
            ['label' => 'Offres actives',          'valeur' => $stats['offres_actives'],         'trend' => '▲ 8%',  'color' => 'text-green-500', 'icon' => '💼'],
            ['label' => 'Nouvelles candidatures',   'valeur' => $stats['nouvelles_candidatures'],  'trend' => '▲ 12',  'color' => 'text-green-500', 'icon' => '📄'],
            ['label' => 'Entretiens aujourd\'hui',  'valeur' => $stats['entretiens_aujourdhui'],   'trend' => '',       'color' => '',               'icon' => '📅'],
            ['label' => 'Offres envoyées',          'valeur' => $stats['offres_envoyees'],         'trend' => '▼ 2%',  'color' => 'text-red-500',   'icon' => '📨'],
        ] as $stat)
            <div class="bg-white rounded-2xl border border-gray-100 p-4">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ $stat['icon'] }}</span>
                    <div>
                        <p class="text-xs text-gray-400">{{ $stat['label'] }}</p>
                        <p class="text-2xl font-bold text-gray-900">{{ $stat['valeur'] }}</p>
                        @if($stat['trend'])
                            <p class="text-xs {{ $stat['color'] }} font-medium">{{ $stat['trend'] }}</p>
                        @endif
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    {{-- LIGNE 2 : Smart Match IA + Candidatures récentes --}}
    <div class="grid grid-cols-5 gap-5 mb-5">

        {{-- Smart Match IA --}}
        <div class="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-1">
                <h2 class="font-bold text-gray-900">Smart Match IA</h2>
                <span class="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">EN DIRECT</span>
            </div>
            <p class="text-xs text-gray-400 mb-4">Meilleurs candidats pour : Senior Product Designer</p>

            @foreach([
                ['nom' => 'Elena Rodriguez', 'exp' => '8 ans d\'exp • Adobe, Figma', 'score' => 98, 'tags' => ['Design Visuel', 'Leadership'], 'avatar' => '44'],
                ['nom' => 'Marcus Chen',     'exp' => '6 ans d\'exp • Recherche UX',  'score' => 94, 'tags' => ['Analyse', 'Prototypage'],     'avatar' => '33'],
                ['nom' => 'Julian Vane',     'exp' => '5 ans d\'exp • Design Systems','score' => 91, 'tags' => ['Tokens', 'Scalabilité'],      'avatar' => '51'],
            ] as $candidat)
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                    <img src="https://i.pravatar.cc/36?img={{ $candidat['avatar'] }}" class="w-9 h-9 rounded-full object-cover">
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-semibold text-gray-900">{{ $candidat['nom'] }}</p>
                            <span class="text-blue-600 font-bold text-sm">{{ $candidat['score'] }}%</span>
                        </div>
                        <p class="text-xs text-gray-400 mb-1.5">{{ $candidat['exp'] }}</p>
                        <div class="flex gap-1 flex-wrap">
                            @foreach($candidat['tags'] as $tag)
                                <span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{{ $tag }}</span>
                            @endforeach
                        </div>
                    </div>
                </div>
            @endforeach

            <button class="w-full mt-2 text-blue-600 text-sm font-semibold py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                Voir tous les matchs
            </button>
        </div>

        {{-- Candidatures récentes --}}
        <div class="col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="font-bold text-gray-900">Candidatures récentes</h2>
                <div class="flex gap-2">
                    <button class="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-600">Tous les statuts</button>
                    <button class="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-600">Exporter CSV</button>
                </div>
            </div>

            <table class="w-full text-sm">
                <thead>
                <tr class="text-xs text-gray-400 border-b border-gray-100">
                    <th class="text-left pb-3">CANDIDAT</th>
                    <th class="text-left pb-3">POSTE VISÉ</th>
                    <th class="text-left pb-3">DATE</th>
                    <th class="text-left pb-3">STATUT</th>
                    <th class="text-left pb-3">SCORE</th>
                    <th class="text-left pb-3">ACTIONS</th>
                </tr>
                </thead>
                <tbody>
                @forelse($candidatures_recentes as $c)
                    <tr class="border-b border-gray-50 hover:bg-gray-50">
                        <td class="py-3">
                            <div class="flex items-center gap-2">
                                <img src="https://i.pravatar.cc/32?u={{ $c->candidat->utilisateur->email ?? '' }}" class="w-8 h-8 rounded-full">
                                <div>
                                    <p class="font-medium text-gray-900 text-sm">{{ $c->candidat->utilisateur->name ?? 'N/A' }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 text-gray-600 text-xs">{{ $c->offre->titre ?? 'N/A' }}</td>
                        <td class="py-3 text-gray-400 text-xs">{{ $c->postule_le->format('M d, Y') }}</td>
                        <td class="py-3">
                            @php
                                $badge = match($c->statut) {
                                    'nouveau'       => 'badge-nouveau',
                                    'preselection'  => 'badge-preselection',
                                    'entretien'     => 'badge-entretien',
                                    'offre_envoyee' => 'badge-offre-envoyee',
                                    'rejete'        => 'badge-rejete',
                                    default         => 'bg-gray-100 text-gray-600'
                                };
                            @endphp
                            <span class="badge {{ $badge }}">{{ strtoupper($c->statut) }}</span>
                        </td>
                        <td class="py-3">
                            @if($c->score_matching_ia)
                                <div class="flex items-center gap-2">
                                    <div class="w-14 h-1.5 bg-gray-200 rounded-full">
                                        <div class="h-1.5 bg-green-500 rounded-full" style="width:{{ $c->score_matching_ia }}%"></div>
                                    </div>
                                    <span class="text-xs font-bold">{{ $c->score_matching_ia }}</span>
                                </div>
                            @else
                                <span class="text-gray-300">—</span>
                            @endif
                        </td>
                        <td class="py-3">
                            <button class="text-gray-400 hover:text-gray-600">⋯</button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="py-8 text-center text-gray-400 text-sm">
                            Aucune candidature pour le moment
                        </td>
                    </tr>
                @endforelse
                </tbody>
            </table>

            <div class="flex items-center justify-between mt-3">
                <p class="text-xs text-gray-400">Affichage de {{ $candidatures_recentes->count() }} sur {{ $candidatures_recentes->count() }} candidats</p>
                <div class="flex gap-1">
                    <button class="w-7 h-7 flex items-center justify-center text-gray-400 border border-gray-200 rounded-lg">‹</button>
                    <button class="w-7 h-7 flex items-center justify-center text-gray-400 border border-gray-200 rounded-lg">›</button>
                </div>
            </div>
        </div>
    </div>

    {{-- LIGNE 3 : Pipeline + Temps de recrutement + Talent Insights --}}
    <div class="grid grid-cols-5 gap-5">

        {{-- Pipeline d'entretiens --}}
        <div class="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <h2 class="font-bold text-gray-900 mb-4">Pipeline d'entretiens</h2>
            @foreach([
                ['label' => 'Sourcing',      'nb' => 450, 'w' => '100%'],
                ['label' => 'Présélection',  'nb' => 280, 'w' => '62%'],
                ['label' => 'Technique',     'nb' => 110, 'w' => '24%'],
                ['label' => 'Culturel',      'nb' => 45,  'w' => '10%'],
                ['label' => 'Offre',         'nb' => 12,  'w' => '3%'],
            ] as $etape)
                <div class="flex items-center gap-3 mb-2">
                    <p class="text-xs text-gray-500 w-20 text-right">{{ $etape['label'] }}</p>
                    <div class="flex-1 h-5 bg-blue-100 rounded-sm relative">
                        <div class="h-5 bg-blue-400 rounded-sm flex items-center justify-end pr-2" style="width: {{ $etape['w'] }}">
                            <span class="text-xs text-white font-medium">{{ $etape['nb'] }}</span>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        {{-- Temps de recrutement --}}
        <div class="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="font-bold text-gray-900">Temps de recrutement</h2>
                <button class="text-gray-400 hover:text-gray-600">↺</button>
            </div>
            <svg viewBox="0 0 300 100" class="w-full" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,20 C50,18 100,30 150,50 C200,70 250,80 300,90"
                      fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="0"   cy="20" r="4" fill="#2563EB"/>
                <circle cx="150" cy="50" r="4" fill="#2563EB"/>
                <circle cx="300" cy="90" r="4" fill="#2563EB"/>
            </svg>
            <div class="flex justify-between mt-1">
                @foreach(['Juil', 'Août', 'Sept', 'Oct'] as $m)
                    <span class="text-xs text-gray-400">{{ $m }}</span>
                @endforeach
            </div>
        </div>

        {{-- Talent Insights IA --}}
        <div class="col-span-1 bg-blue-600 rounded-2xl p-5 flex flex-col justify-between">
            <div>
                <p class="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2">Talent Insights IA</p>
                <p class="text-white text-sm font-medium leading-snug">
                    Selon votre pipeline actuel, ouvrir un poste de "Senior Frontend" aujourd'hui aurait un taux de réussite élevé.
                </p>
            </div>
            <button class="mt-4 bg-white text-blue-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition w-fit">
                Lire l'analyse
            </button>
        </div>
    </div>

@endsection
