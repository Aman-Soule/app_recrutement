import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { RecruiterProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RecruiterProfileService {
  private http = inject(HttpClient);

  show(): Observable<RecruiterProfile> {
    return this.http.get<RecruiterProfile>(`${API_BASE_URL}/recruteur/profil`);
  }

  update(payload: Partial<RecruiterProfile>): Observable<{ message: string; profil: RecruiterProfile }> {
    return this.http.put<{ message: string; profil: RecruiterProfile }>(
      `${API_BASE_URL}/recruteur/profil`,
      payload,
    );
  }

  uploadAvatar(fichier: File): Observable<{ message: string; profil: RecruiterProfile }> {
    const formData = new FormData();
    formData.append('avatar', fichier);
    return this.http.post<{ message: string; profil: RecruiterProfile }>(
      `${API_BASE_URL}/recruteur/profil/avatar`,
      formData,
    );
  }
}
