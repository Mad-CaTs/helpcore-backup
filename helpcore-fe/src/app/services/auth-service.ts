import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest } from '../dto/login-request';
import { TokenResponse } from '../dto/token-response';
import { RegisterRequestDTO } from '../dto/register-request-dto';
import { TokenPayload } from '../interfaces/token-payload';
import { jwtDecode } from 'jwt-decode';
import { Usuario } from '../interfaces/usuario';

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

  obtenerUsuarioActual(): Observable<Usuario> {
    const id = this.getCurrentUserId();
    return this.http.get<Usuario>(`${this.baseUrl}/persona/${id}`);
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

  private decodeToken(): TokenPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const decoded = this.decodeToken();
    if (!decoded) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  }

  getUserRoles(): string[] {
    const decoded = this.decodeToken();
    if (!decoded) return [];
    
    if (decoded.roles) return decoded.roles;
    
    if (decoded.rol) return [decoded.rol];
    
    return [];
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  getUserInfo(): TokenPayload | null {
    return this.decodeToken();
  }

  getCurrentUserId(): number | null {
    const decoded = this.decodeToken();
    if (!decoded) return null;
    
    if (decoded.jti) {
      return parseInt(decoded.jti, 10);
    }
    
    return null;
  }

  getUserEmail(): string | null {
    const decoded = this.decodeToken();
    return decoded?.correo || decoded?.sub || null;
  }
}