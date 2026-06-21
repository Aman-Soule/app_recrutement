<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /** Envoyer un message */
    public function store(Request $request)
    {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'contenu'         => 'required|string',
            'application_id'  => 'nullable|exists:applications,id',
        ]);

        $message = Message::create([
            'expediteur_id'   => $request->user()->id,
            'destinataire_id' => $request->destinataire_id,
            'contenu'         => $request->contenu,
            'application_id'  => $request->application_id,
        ]);

        return response()->json([
            'message' => 'Message envoyé',
            'data'    => $message->load('expediteur', 'destinataire'),
        ], 201);
    }

    /** Voir la conversation avec un utilisateur */
    public function conversation(Request $request, $userId)
    {
        $moi = $request->user()->id;

        $messages = Message::where(function ($q) use ($moi, $userId) {
            $q->where('expediteur_id', $moi)->where('destinataire_id', $userId);
        })->orWhere(function ($q) use ($moi, $userId) {
            $q->where('expediteur_id', $userId)->where('destinataire_id', $moi);
        })
            ->with('expediteur', 'destinataire')
            ->orderBy('created_at')
            ->get();

        // Marquer comme lus
        Message::where('expediteur_id', $userId)
            ->where('destinataire_id', $moi)
            ->where('lu', false)
            ->update(['lu' => true, 'lu_le' => now()]);

        return response()->json($messages);
    }

    /** Nombre de messages non lus */
    public function nonLus(Request $request)
    {
        $count = Message::where('destinataire_id', $request->user()->id)
            ->where('lu', false)
            ->count();

        return response()->json(['non_lus' => $count]);
    }
}
