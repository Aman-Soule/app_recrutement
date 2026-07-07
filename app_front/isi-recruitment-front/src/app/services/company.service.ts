import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Company } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);

  show(id: number): Observable<Company> {
    return this.http.get<Company>(`${API_BASE_URL}/entreprises/${id}`);
  }

  create(payload: Partial<Company>): Observable<{ message: string; entreprise: Company }> {
    return this.http.post<{ message: string; entreprise: Company }>(`${API_BASE_URL}/entreprises`, payload);
  }

  update(id: number, payload: Partial<Company>): Observable<{ message: string; entreprise: Company }> {
    return this.http.put<{ message: string; entreprise: Company }>(
      `${API_BASE_URL}/entreprises/${id}`,
      payload,
    );
  }

  uploadLogo(id: number, fichier: File): Observable<{ message: string; entreprise: Company }> {
    const formData = new FormData();
    formData.append('logo', fichier);
    return this.http.post<{ message: string; entreprise: Company }>(
      `${API_BASE_URL}/entreprises/${id}/logo`,
      formData,
    );
  }
}
