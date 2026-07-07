import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);

  nonLus(): Observable<{ non_lus: number }> {
    return this.http.get<{ non_lus: number }>(`${API_BASE_URL}/messages/non-lus`);
  }
}
