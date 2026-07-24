import { Company, RecruiterProfile, TypeContrat, TypeLieu } from './user.model';
import { Application } from './application.model';

export type StatutOffre = 'brouillon' | 'actif' | 'ferme';

export interface JobOffer {
  id: number;
  company_id: number;
  recruiter_profile_id: number;
  reference: string;
  titre: string;
  departement: string | null;
  description: string | null;
  exigences: string | null;
  localisation: string | null;
  type_lieu: TypeLieu;
  type_contrat: TypeContrat;
  salaire_min: string | null;
  salaire_max: string | null;
  statut: StatutOffre;
  competences_requises: number[] | null;
  nombre_candidats: number;
  publie_le: string | null;
  created_at: string;
  updated_at: string;
  entreprise?: Company;
  recruteur?: RecruiterProfile;
  candidatures?: Application[];
  /** Présent uniquement sur /candidat/offres-recommandees */
  score_matching?: number;
}

export interface CompanyWithOffres extends Company {
  offres?: JobOffer[];
}
