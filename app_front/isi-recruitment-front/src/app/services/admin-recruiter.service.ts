import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { RecruiterProfile, User } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';

export interface AdminRecruiterFilters {
  company_id?: number;
  recherche?: string;
  page?: number;
}

export interface CreateRecruiterPayload {
  name: string;
  email: string;
  company_id?: number;
  company_nom?: string;
  titre?: string;
  telephone?: string;
}

export interface CreateRecruiterResponse {
  message: string;
  user: User;
  profil: RecruiterProfile;
  temp_password: string;
}

@Injectable({ providedIn: 'root' })
export class AdminRecruiterService {
  private http = inject(HttpClient);

  list(filters: AdminRecruiterFilters = {}): Observable<PaginatedResponse<User>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PaginatedResponse<User>>(`${API_BASE_URL}/admin/recruteurs`, { params });
  }

  show(userId: number): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/admin/recruteurs/${userId}`);
  }

  create(payload: CreateRecruiterPayload): Observable<CreateRecruiterResponse> {
    return this.http.post<CreateRecruiterResponse>(`${API_BASE_URL}/admin/recruteurs`, payload);
  }

  update(
    userId: number,
    payload: Partial<CreateRecruiterPayload>,
  ): Observable<{ message: string; user: User; profil: RecruiterProfile }> {
    return this.http.put<{ message: string; user: User; profil: RecruiterProfile }>(
      `${API_BASE_URL}/admin/recruteurs/${userId}`,
      payload,
    );
  }
}
