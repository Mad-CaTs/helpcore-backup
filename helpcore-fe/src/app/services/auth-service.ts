import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest } from '../dto/login-request';
import { TokenResponse } from '../dto/token-response';
import { RegisterRequestDTO } from '../dto/register-request-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private path = environment.authService;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl + this.path}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.isAuthenticatedSubject.next(true);
        console.log('Tokens guardados:', response);
      })
    );
  }

  register(request: RegisterRequestDTO): Observable<TokenResponse> {
      return this.http.post<TokenResponse>(`${this.baseUrl + this.path}/register`, request).pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          this.isAuthenticatedSubject.next(true);
        })
      );
    }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<TokenResponse>(
      `${this.baseUrl + this.path}/refresh`, 
      {},
      { headers: { 'Authorization': `Bearer ${refreshToken}` } }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl + this.path}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.isAuthenticatedSubject.next(false);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}