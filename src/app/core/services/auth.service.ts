import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isInitialCheckDone = signal<boolean>(false);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  logout(): Observable<void> {
    this.isLoading.set(true);
    return this.http.post<void>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
        return of(void 0);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  checkAuth(): Observable<User | null> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isInitialCheckDone.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isInitialCheckDone.set(true);
        return of(null);
      })
    );
  }

  clearSession(): void {
    this.currentUser.set(null);
  }
}
