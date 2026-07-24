import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { CandidateProfile, NiveauCompetence } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';
import { Application } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class CandidateProfileService {
  private http = inject(HttpClient);

  show(): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${API_BASE_URL}/candidat/profil`);
  }

  update(payload: Partial<CandidateProfile>): Observable<{ message: string; profil: CandidateProfile }> {
    return this.http.put<{ message: string; profil: CandidateProfile }>(
      `${API_BASE_URL}/candidat/profil`,
      payload,
    );
  }

  syncCompetences(
    competences: { skill_id: number; niveau: NiveauCompetence }[],
  ): Observable<{ message: string; competences: unknown[] }> {
    return this.http.post<{ message: string; competences: unknown[] }>(
      `${API_BASE_URL}/candidat/profil/competences`,
      { competences },
    );
  }

  /** Recruteur : profils candidats ayant postulé à ses offres */
  pourRecruteur(recherche?: string, page = 1): Observable<PaginatedResponse<CandidateProfile>> {
    let params = new HttpParams().set('page', page);
    if (recherche) params = params.set('recherche', recherche);
    return this.http.get<PaginatedResponse<CandidateProfile>>(`${API_BASE_URL}/recruteur/candidats`, {
      params,
    });
  }

  /** Recruteur : détail complet d'un candidat ayant postulé à ses offres */
  getById(id: number): Observable<{ profil: CandidateProfile; candidatures: Application[] }> {
    return this.http.get<{ profil: CandidateProfile; candidatures: Application[] }>(
      `${API_BASE_URL}/recruteur/candidats/${id}`,
    );
  }

  uploadAvatar(fichier: File): Observable<{ message: string; profil: CandidateProfile }> {
    const formData = new FormData();
    formData.append('avatar', fichier);
    return this.http.post<{ message: string; profil: CandidateProfile }>(
      `${API_BASE_URL}/candidat/profil/avatar`,
      formData,
    );
  }

  uploadCv(fichier: File): Observable<{ message: string; profil: CandidateProfile }> {
    const formData = new FormData();
    formData.append('cv', fichier);
    return this.http.post<{ message: string; profil: CandidateProfile }>(
      `${API_BASE_URL}/candidat/profil/cv`,
      formData,
    );
  }
}
