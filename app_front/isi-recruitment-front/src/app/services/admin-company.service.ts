import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Company, RecruiterProfile } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';

export interface AdminCompanyFilters {
  recherche?: string;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminCompanyService {
  private http = inject(HttpClient);

  list(filters: AdminCompanyFilters = {}): Observable<PaginatedResponse<Company>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PaginatedResponse<Company>>(`${API_BASE_URL}/admin/entreprises`, { params });
  }

  show(id: number): Observable<Company & { recruteurs: RecruiterProfile[] }> {
    return this.http.get<Company & { recruteurs: RecruiterProfile[] }>(
      `${API_BASE_URL}/admin/entreprises/${id}`,
    );
  }

  create(payload: Partial<Company>): Observable<{ message: string; entreprise: Company }> {
    return this.http.post<{ message: string; entreprise: Company }>(
      `${API_BASE_URL}/admin/entreprises`,
      payload,
    );
  }

  update(id: number, payload: Partial<Company>): Observable<{ message: string; entreprise: Company }> {
    return this.http.put<{ message: string; entreprise: Company }>(
      `${API_BASE_URL}/admin/entreprises/${id}`,
      payload,
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/admin/entreprises/${id}`);
  }
}
