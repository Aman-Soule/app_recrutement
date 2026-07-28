import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { AiMatchScore } from '../models/application.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class AiMatchScoreService {
  private http = inject(HttpClient);

  /** Recruteur : candidats classés par score IA pour une offre précise */
  meilleursCandidats(jobOfferId: number, page = 1): Observable<PaginatedResponse<AiMatchScore>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PaginatedResponse<AiMatchScore>>(
      `${API_BASE_URL}/offres/${jobOfferId}/meilleurs-candidats`,
      { params },
    );
  }
}
