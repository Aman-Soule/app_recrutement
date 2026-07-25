import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { User } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';

export interface AdminUserFilters {
  role?: string;
  recherche?: string;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);

  list(filters: AdminUserFilters = {}): Observable<PaginatedResponse<User>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PaginatedResponse<User>>(`${API_BASE_URL}/admin/utilisateurs`, { params });
  }

  show(id: number): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/admin/utilisateurs/${id}`);
  }

  update(id: number, payload: { name: string; email: string }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(
      `${API_BASE_URL}/admin/utilisateurs/${id}`,
      payload,
    );
  }
}
