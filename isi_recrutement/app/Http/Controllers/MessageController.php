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

        if ($request->user()->estCandidat()) {
            $dejaContacte = Message::where('expediteur_id', $request->destinataire_id)
                ->where('destinataire_id', $request->user()->id)
                ->exists();

            if (!$dejaContacte) {
                return response()->json([
                    'message' => "Vous ne pouvez pas initier une conversation. Attendez qu'un recruteur vous contacte d'abord.",
                ], 403);
            }
        }

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

    /** Liste des conversations de l'utilisateur courant, groupées par interlocuteur */
    public function conversations(Request $request)
    {
        $moi = $request->user()->id;

        $conversations = Message::where('expediteur_id', $moi)
            ->orWhere('destinataire_id', $moi)
            ->with('expediteur', 'destinataire')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy(fn ($m) => $m->expediteur_id === $moi ? $m->destinataire_id : $m->expediteur_id)
            ->map(function ($messages) use ($moi) {
                $dernier = $messages->first();
                return [
                    'utilisateur'     => $dernier->expediteur_id === $moi ? $dernier->destinataire : $dernier->expediteur,
                    'dernier_message' => $dernier,
                    'non_lus'         => $messages->where('destinataire_id', $moi)->where('lu', false)->count(),
                ];
            })
            ->values();

        return response()->json($conversations);
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
