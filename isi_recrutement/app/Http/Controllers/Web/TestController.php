<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CandidateProfile;
use App\Models\RecruiterProfile;
use App\Models\Company;
use App\Models\Skill;
use App\Models\JobOffer;
use App\Models\Application;
use App\Models\Interview;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    public function index()
    {
        $stats = [
            'utilisateurs'  => User::count(),
            'candidats'     => CandidateProfile::count(),
            'recruteurs'    => RecruiterProfile::count(),
            'entreprises'   => Company::count(),
            'competences'   => Skill::count(),
            'offres'        => JobOffer::count(),
            'candidatures'  => Application::count(),
            'entretiens'    => Interview::count(),
        ];

        $derniers_utilisateurs = User::latest()->take(5)->get();
        $tables = DB::select('SHOW TABLES');

        return view('test.db', compact('stats', 'derniers_utilisateurs', 'tables'));
    }
}
