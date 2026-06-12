import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface UserSession {
  token: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = window.location.hostname === 'localhost' && window.location.port === '4200'
    ? 'http://localhost:8080/api'
    : '/api';
  
  private currentSessionSubject = new BehaviorSubject<UserSession | null>(this.loadSession());
  public currentSession$ = this.currentSessionSubject.asObservable();

  private loadSession(): UserSession | null {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('auth_username');
    const role = localStorage.getItem('auth_role');
    
    if (token && username && role) {
      return { token, username, role };
    }
    return null;
  }

  login(username: string, password: String): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap(session => {
        localStorage.setItem('auth_token', session.token);
        localStorage.setItem('auth_username', session.username);
        localStorage.setItem('auth_role', session.role);
        this.currentSessionSubject.next(session);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    localStorage.removeItem('auth_role');
    this.currentSessionSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    return this.currentSessionSubject.value !== null;
  }

  isAdmin(): boolean {
    const session = this.currentSessionSubject.value;
    return session ? session.role === 'ROLE_ADMIN' : false;
  }

  getCurrentUsername(): string | null {
    const session = this.currentSessionSubject.value;
    return session ? session.username : null;
  }
}
