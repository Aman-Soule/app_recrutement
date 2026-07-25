<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Votre compte recruteur</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f5f7; padding:24px; color:#1f2937;">
    <table role="presentation" style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
            <td style="background:#2563eb; padding:20px 24px;">
                <span style="color:#ffffff; font-size:18px; font-weight:bold;">TalentAI</span>
            </td>
        </tr>
        <tr>
            <td style="padding:24px;">
                <h2 style="margin-top:0;">Bonjour {{ $user->name }},</h2>
                <p>Un compte recruteur vient d'être créé pour vous sur TalentAI par un administrateur.</p>
                <table role="presentation" style="width:100%; border-collapse:collapse; margin:16px 0;">
                    <tr>
                        <td style="padding:6px 0; color:#6b7280;">Adresse e-mail</td>
                        <td style="padding:6px 0; font-weight:bold;">{{ $user->email }}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0; color:#6b7280;">Mot de passe temporaire</td>
                        <td style="padding:6px 0; font-weight:bold; font-family: monospace; background:#f4f5f7; border-radius:4px;">{{ $tempPassword }}</td>
                    </tr>
                </table>
                <p>Connectez-vous avec ces identifiants puis changez votre mot de passe dès que possible depuis votre compte.</p>
                <p style="color:#6b7280; font-size:13px;">
                    Si vous ne vous attendiez pas à recevoir cet e-mail, contactez votre administrateur.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
