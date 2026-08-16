import { CandidateProfile } from './user.model';
import { JobOffer } from './job.model';
import { Interview } from './interview.model';

export type StatutCandidature =
  | 'nouveau'
  | 'examen'
  | 'preselection'
  | 'entretien'
  | 'embauche'
  | 'rejete';

export type SourceScoreIa = 'ia' | 'heuristique';

export interface AiMatchScore {
  id: number;
  candidate_profile_id: number;
  job_offer_id: number;
  score_global: number;
  score_competences: number | null;
  score_experience: number | null;
  score_localisation: number | null;
  score_salaire: number | null;
  competences_matchees: string[] | null;
  competences_manquantes: string[] | null;
  resume_ia: string | null;
  source: SourceScoreIa;
  calcule_le: string;
  candidat?: CandidateProfile;
}

export interface Application {
  id: number;
  candidate_profile_id: number;
  job_offer_id: number;
  statut: StatutCandidature;
  score_matching_ia: number | null;
  score_ia_erreur: string | null;
  lettre_motivation: string | null;
  lettre_motivation_url: string | null;
  cv_url: string | null;
  notes_recruteur: string | null;
  postule_le: string;
  created_at: string;
  updated_at: string;
  offre?: JobOffer;
  candidat?: CandidateProfile;
  entretiens?: Interview[];
  /** Détail du score IA (sous-scores, compétences matchées/manquantes) */
  score_detaille?: AiMatchScore | null;
}

export const ETAPES_CANDIDATURE: StatutCandidature[] = [
  'nouveau',
  'examen',
  'preselection',
  'entretien',
  'embauche',
];

export const LIBELLES_STATUT_CANDIDATURE: Record<StatutCandidature, string> = {
  nouveau: 'Nouveau',
  examen: 'Examen',
  preselection: 'Présélection',
  entretien: 'Entretien',
  embauche: 'Embauché',
  rejete: 'Rejeté',
};