<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** Lister les notifications de l'utilisateur connecté */
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->notifications()->paginate(15)
        );
    }

    /** Nombre de notifications non lues */
    public function nonLues(Request $request)
    {
        return response()->json([
            'non_lues' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /** Marquer une notification comme lue */
    public function marquerLu(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /** Marquer toutes les notifications comme lues */
    public function marquerToutLu(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }
}
