import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { API_BASE_URL } from './api';
import { Role, User } from '../models/user.model';

interface AuthResponse {
  message: string;
  user: User;
  token: string;
  role: Role;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: Role;
}

const TOKEN_KEY = 'talentai_token';
const USER_KEY = 'talentai_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly currentUser = signal<User | null>(this.readStoredUser());
  readonly role = computed<Role | null>(() => this.currentUser()?.role ?? null);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/login`, { email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/register`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  /** Révoque le token côté serveur puis nettoie la session locale, même en cas d'échec réseau */
  logout(): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  clearSession(): void {
    this.currentUser.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  me(): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/user`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (this.isBrowser) localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
    );
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private persistSession(res: AuthResponse): void {
    this.currentUser.set(res.user);
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
  }

  private readStoredUser(): User | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
