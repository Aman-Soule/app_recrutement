import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Application, StatutCandidature } from '../models/application.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);

  /** Candidat : postuler à une offre */
  postuler(
    jobOfferId: number,
    payload: { lettre_motivation?: string; cv_url?: string } = {},
  ): Observable<{ message: string; candidature: Application }> {
    return this.http.post<{ message: string; candidature: Application }>(
      `${API_BASE_URL}/offres/${jobOfferId}/postuler`,
      payload,
    );
  }

  /** Candidat : ses propres candidatures */
  mesCandidatures(): Observable<Application[]> {
    return this.http.get<Application[]>(`${API_BASE_URL}/candidat/candidatures`);
  }

  /** Candidat : détail d'une de ses candidatures */
  voir(applicationId: number): Observable<Application> {
    return this.http.get<Application>(`${API_BASE_URL}/candidat/candidatures/${applicationId}`);
  }

  /** Recruteur : candidatures reçues sur une offre précise */
  parOffre(jobOfferId: number, page = 1): Observable<PaginatedResponse<Application>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PaginatedResponse<Application>>(
      `${API_BASE_URL}/offres/${jobOfferId}/candidatures`,
      { params },
    );
  }

  /** Recruteur : toutes les candidatures reçues sur ses offres */
  pourRecruteur(page = 1, perPage?: number): Observable<PaginatedResponse<Application>> {
    let params = new HttpParams().set('page', page);
    if (perPage) params = params.set('per_page', perPage);
    return this.http.get<PaginatedResponse<Application>>(`${API_BASE_URL}/recruteur/candidatures`, {
      params,
    });
  }

  /** Recruteur : changer le statut d'une candidature */
  changerStatut(
    applicationId: number,
    statut: StatutCandidature,
    notes_recruteur?: string,
  ): Observable<{ message: string; candidature: Application }> {
    return this.http.put<{ message: string; candidature: Application }>(
      `${API_BASE_URL}/candidatures/${applicationId}/statut`,
      { statut, notes_recruteur },
    );
  }
}
