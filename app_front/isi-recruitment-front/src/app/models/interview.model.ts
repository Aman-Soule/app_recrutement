import { Application } from './application.model';
import { RecruiterProfile } from './user.model';

export type TypeEntretien = 'video' | 'physique' | 'telephonique';
export type EtapeEntretien = 'rh' | 'technique' | 'culturel' | 'final';
export type StatutEntretien = 'en_attente' | 'confirme' | 'termine' | 'annule';

export interface Interview {
  id: number;
  application_id: number;
  recruiter_profile_id: number;
  type: TypeEntretien;
  etape: EtapeEntretien;
  planifie_le: string;
  duree_minutes: number;
  lieu_ou_lien: string | null;
  plateforme: string | null;
  statut: StatutEntretien;
  notes_preparation: string | null;
  note: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  candidature?: Application;
  recruteur?: RecruiterProfile;
}

export const LIBELLES_TYPE_ENTRETIEN: Record<TypeEntretien, string> = {
  video: 'Visioconférence',
  physique: 'Présentiel',
  telephonique: 'Téléphonique',
};

export const LIBELLES_STATUT_ENTRETIEN: Record<StatutEntretien, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  termine: 'Terminé',
  annule: 'Annulé',
};

export const LIBELLES_ETAPE_ENTRETIEN: Record<EtapeEntretien, string> = {
  rh: 'RH',
  technique: 'Technique',
  culturel: 'Culturel',
  final: 'Final',
};
