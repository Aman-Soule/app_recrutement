import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { JobOffer } from '../models/job.model';
import { PaginatedResponse } from '../models/pagination.model';

export interface JobFilters {
  statut?: string;
  type_lieu?: string;
  type_contrat?: string;
  recherche?: string;
  mine?: boolean;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);

  list(filters: JobFilters = {}): Observable<PaginatedResponse<JobOffer>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PaginatedResponse<JobOffer>>(`${API_BASE_URL}/offres`, { params });
  }

  get(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${API_BASE_URL}/offres/${id}`);
  }

  create(payload: Partial<JobOffer>): Observable<{ message: string; offre: JobOffer }> {
    return this.http.post<{ message: string; offre: JobOffer }>(`${API_BASE_URL}/offres`, payload);
  }

  update(id: number, payload: Partial<JobOffer>): Observable<{ message: string; offre: JobOffer }> {
    return this.http.put<{ message: string; offre: JobOffer }>(`${API_BASE_URL}/offres/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/offres/${id}`);
  }

  recommandees(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${API_BASE_URL}/candidat/offres-recommandees`);
  }
}
