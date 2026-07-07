import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Skill } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private http = inject(HttpClient);

  list(recherche?: string): Observable<Skill[]> {
    let params = new HttpParams();
    if (recherche) params = params.set('recherche', recherche);
    return this.http.get<Skill[]>(`${API_BASE_URL}/competences`, { params });
  }
}
