import { CandidateProfile } from './user.model';
import { JobOffer } from './job.model';
import { Interview } from './interview.model';

export type StatutCandidature =
  | 'nouveau'
  | 'preselection'
  | 'examen'
  | 'entretien'
  | 'offre_envoyee'
  | 'rejete'
  | 'embauche';

export interface Application {
  id: number;
  candidate_profile_id: number;
  job_offer_id: number;
  statut: StatutCandidature;
  score_matching_ia: number | null;
  lettre_motivation: string | null;
  cv_url: string | null;
  notes_recruteur: string | null;
  postule_le: string;
  created_at: string;
  updated_at: string;
  offre?: JobOffer;
  candidat?: CandidateProfile;
  entretiens?: Interview[];
}

export const ETAPES_CANDIDATURE: StatutCandidature[] = [
  'nouveau',
  'preselection',
  'examen',
  'entretien',
  'offre_envoyee',
];

export const LIBELLES_STATUT_CANDIDATURE: Record<StatutCandidature, string> = {
  nouveau: 'Nouveau',
  preselection: 'Présélection',
  examen: 'Examen',
  entretien: 'Entretien',
  offre_envoyee: 'Offre envoyée',
  rejete: 'Rejeté',
  embauche: 'Embauché',
};
