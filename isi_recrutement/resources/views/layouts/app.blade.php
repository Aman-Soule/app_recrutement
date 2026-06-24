<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TalentAI — @yield('title', 'Recrutement Intelligent')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#2563EB',
                        'primary-dark': '#1D4ED8',
                    }
                }
            }
        }
    </script>
    <style>
        .nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            color: #4B5563;
            text-decoration: none;
            margin-bottom: 2px;
            transition: background 0.15s;
        }
        .nav-item:hover { background-color: #F9FAFB; }
        .nav-item.active {
            background-color: #EFF6FF;
            color: #2563EB;
            font-weight: 600;
            border-right: 3px solid #2563EB;
            border-radius: 8px 0 0 8px;
        }

        /* Badges statut */
        .badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
        .badge-nouveau       { background:#EFF6FF; color:#2563EB; }
        .badge-preselection  { background:#F5F3FF; color:#7C3AED; }
        .badge-examen        { background:#FFF7ED; color:#EA580C; }
        .badge-entretien     { background:#FFF7ED; color:#EA580C; }
        .badge-offre-envoyee { background:#F0FDF4; color:#16A34A; }
        .badge-embauche      { background:#F0FDF4; color:#16A34A; }
        .badge-rejete        { background:#FEF2F2; color:#DC2626; }
        .badge-actif         { background:#F0FDF4; color:#16A34A; }
        .badge-brouillon     { background:#FFF7ED; color:#EA580C; }
        .badge-ferme         { background:#F3F4F6; color:#6B7280; }

        /* Toggle switch */
        .toggle { position:relative; display:inline-block; width:44px; height:24px; }
        .toggle input { opacity:0; width:0; height:0; }
        .slider {
            position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0;
            background-color:#D1D5DB; border-radius:24px; transition:.3s;
        }
        .slider:before {
            position:absolute; content:""; height:18px; width:18px; left:3px; bottom:3px;
            background-color:white; border-radius:50%; transition:.3s;
        }
        input:checked + .slider { background-color:#2563EB; }
        input:checked + .slider:before { transform:translateX(20px); }
    </style>
</head>
<body class="bg-gray-50 font-sans antialiased">

<div class="flex h-screen overflow-hidden">

    {{-- ===================== SIDEBAR ===================== --}}
    <aside class="w-52 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">

        {{-- Logo --}}
        <div class="px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <x-icon name="layers" class="w-4 h-4 text-white" />
                </div>
                <span class="font-bold text-gray-900 text-lg tracking-tight">TalentAI</span>
            </div>
        </div>

        {{-- Navigation --}}
        <nav class="flex-1 px-3 py-4 overflow-y-auto">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
                @yield('nav_section', 'MENU PRINCIPAL')
            </p>
            @yield('sidebar_nav')
        </nav>

        {{-- Forfait Pro --}}
        <div class="mx-3 mb-3 p-3 bg-blue-50 rounded-xl">
            <p class="text-xs font-bold text-blue-600 mb-1">Forfait Pro</p>
            <p class="text-xs text-gray-500 leading-tight">Matching IA activé pour toutes les offres actives.</p>
            <div class="mt-2 h-1.5 bg-blue-200 rounded-full">
                <div class="h-1.5 bg-blue-600 rounded-full" style="width: 65%"></div>
            </div>
        </div>

    </aside>

    {{-- ===================== MAIN ===================== --}}
    <div class="flex-1 ml-52 flex flex-col min-h-screen overflow-hidden">

        {{-- TOPBAR --}}
        <header class="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
            <div class="relative">
                <span class="absolute left-3 top-2.5 text-gray-400">
                    <x-icon name="search" class="w-4 h-4" />
                </span>
                <input
                    type="text"
                    placeholder="@yield('search_placeholder', 'Rechercher...')"
                    class="pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-lg border-none outline-none w-80 focus:bg-gray-200 transition"
                >
            </div>
            <div class="flex items-center gap-3">
                <button class="relative p-2 text-gray-400 hover:text-gray-600">
                    <x-icon name="bell" class="w-5 h-5" />
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div class="flex items-center gap-2.5">
                    <div class="text-right">
                        <p class="text-sm font-semibold text-gray-900 leading-tight">{{ Auth::user()->name ?? '' }}</p>
                        <p class="text-xs text-gray-400">{{ Auth::user()->role ?? '' }}</p>
                    </div>
                    <img src="https://i.pravatar.cc/36?img=47" class="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100" alt="Avatar">
                    <form action="{{ route('logout') }}" method="POST">
                        @csrf
                        <button type="submit" class="text-gray-400 hover:text-red-500 transition p-1" title="Déconnexion">
                            <x-icon name="logout" class="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </header>

        {{-- PAGE CONTENT --}}
        <main class="flex-1 overflow-y-auto p-6">
            @yield('content')
        </main>

    </div>
</div>

@yield('scripts')
</body>
</html>
