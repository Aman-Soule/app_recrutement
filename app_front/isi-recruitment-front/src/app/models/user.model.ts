export type Role = 'admin' | 'recruiter' | 'candidate';
export type Disponibilite = 'disponible' | 'a_lecoute' | 'non_disponible';
export type TypeContrat = 'temps_plein' | 'temps_partiel' | 'freelance' | 'stage';
export type TypeLieu = 'teletravail' | 'hybride' | 'presentiel';
export type NiveauCompetence = 'debutant' | 'intermediaire' | 'avance' | 'expert';

export interface Skill {
  id: number;
  nom: string;
  categorie: string | null;
  pivot?: {
    niveau: NiveauCompetence;
    verifie: boolean;
    score_verification: number | null;
  };
}

export interface Company {
  id: number;
  nom: string;
  secteur: string | null;
  description: string | null;
  logo_url: string | null;
  site_web: string | null;
  taille: 'startup' | 'pme' | 'grand_groupe' | null;
  localisation: string | null;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  titre: string | null;
  biographie: string | null;
  localisation: string | null;
  avatar_url: string | null;
  cv_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  annees_experience: number;
  force_profil: number;
  score_employabilite: number;
  disponibilite: Disponibilite;
  salaire_min_souhaite: string | null;
  salaire_max_souhaite: string | null;
  type_contrat_souhaite: TypeContrat | null;
  type_lieu_souhaite: TypeLieu | null;
  competences?: Skill[];
  utilisateur?: User;
}

export interface RecruiterProfile {
  id: number;
  user_id: number;
  company_id: number | null;
  titre: string | null;
  avatar_url: string | null;
  telephone: string | null;
  forfait: 'gratuit' | 'pro' | 'entreprise';
  entreprise?: Company;
  utilisateur?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
  profil_candidat?: CandidateProfile;
  profil_recruteur?: RecruiterProfile;
}

export interface AdminStats {
  entreprises: number;
  recruteurs: number;
  candidats: number;
  offres_actives: number;
  candidatures: number;
  embauches: number;
  company_id: number | null;
}
