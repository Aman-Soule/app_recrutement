import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { AdminStats } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private http = inject(HttpClient);

  get(companyId?: number): Observable<AdminStats> {
    let params = new HttpParams();
    if (companyId) params = params.set('company_id', String(companyId));
    return this.http.get<AdminStats>(`${API_BASE_URL}/admin/stats`, { params });
  }
}
