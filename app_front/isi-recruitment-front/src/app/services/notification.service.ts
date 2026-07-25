import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api';
import { AppNotification } from '../models/notification.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  list(page = 1): Observable<PaginatedResponse<AppNotification>> {
    return this.http.get<PaginatedResponse<AppNotification>>(`${API_BASE_URL}/notifications`, {
      params: { page },
    });
  }

  nonLues(): Observable<{ non_lues: number }> {
    return this.http.get<{ non_lues: number }>(`${API_BASE_URL}/notifications/non-lues`);
  }

  marquerLu(id: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_BASE_URL}/notifications/${id}/lu`, {});
  }

  marquerToutLu(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_BASE_URL}/notifications/lu-tout`, {});
  }
}
