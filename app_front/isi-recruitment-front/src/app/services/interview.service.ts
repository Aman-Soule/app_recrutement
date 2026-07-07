import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { Interview } from '../models/interview.model';

export interface InterviewPayload {
  type: string;
  etape: string;
  planifie_le: string;
  duree_minutes?: number;
  lieu_ou_lien?: string;
  plateforme?: string;
  notes_preparation?: string;
}

export interface InterviewFeedbackPayload {
  note: number;
  feedback?: string;
  statut: 'termine' | 'annule';
}

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private http = inject(HttpClient);

  /** Recruteur : ses entretiens, optionnellement filtrés par statut */
  index(statut?: string): Observable<Interview[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get<Interview[]>(`${API_BASE_URL}/entretiens`, { params });
  }

  store(
    applicationId: number,
    payload: InterviewPayload,
  ): Observable<{ message: string; entretien: Interview }> {
    return this.http.post<{ message: string; entretien: Interview }>(
      `${API_BASE_URL}/candidatures/${applicationId}/entretiens`,
      payload,
    );
  }

  feedback(
    interviewId: number,
    payload: InterviewFeedbackPayload,
  ): Observable<{ message: string; entretien: Interview }> {
    return this.http.put<{ message: string; entretien: Interview }>(
      `${API_BASE_URL}/entretiens/${interviewId}/feedback`,
      payload,
    );
  }
}
