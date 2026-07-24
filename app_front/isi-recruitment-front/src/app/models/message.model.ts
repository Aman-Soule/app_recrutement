import { User } from './user.model';

export interface Message {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  application_id: number | null;
  contenu: string;
  lu: boolean;
  lu_le: string | null;
  created_at: string;
  updated_at: string;
  expediteur?: User;
  destinataire?: User;
}

export interface ConversationSummary {
  utilisateur: User;
  dernier_message: Message;
  non_lus: number;
}
