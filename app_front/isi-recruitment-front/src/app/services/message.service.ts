import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { ConversationSummary, Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);

  nonLus(): Observable<{ non_lus: number }> {
    return this.http.get<{ non_lus: number }>(`${API_BASE_URL}/messages/non-lus`);
  }

  conversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${API_BASE_URL}/messages/conversations`);
  }

  conversation(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${API_BASE_URL}/messages/conversation/${userId}`);
  }

  send(destinataireId: number, contenu: string, applicationId?: number): Observable<{ message: string; data: Message }> {
    return this.http.post<{ message: string; data: Message }>(`${API_BASE_URL}/messages`, {
      destinataire_id: destinataireId,
      contenu,
      application_id: applicationId ?? null,
    });
  }
}
