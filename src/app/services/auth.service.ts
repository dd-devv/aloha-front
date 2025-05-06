import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { TokenDecoderService } from './token-decoder.service';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export default class AuthService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private tokenDecoder = inject(TokenDecoderService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signals para estado de autenticación
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  userRole = signal<String | null>(null);

  // Subject para controlar el estado de verificación inicial
  private authChecked = new BehaviorSubject<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Verificar el estado de autenticación en el navegador
      this.checkAuthStatus().subscribe();
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      username,
      password
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}auth/login`, loginData)
      .pipe(
        tap(response => {
          this.tokenStorage.setToken(response.data.token);
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);

          // Actualizar el rol desde el token decodificado
          const role = this.tokenDecoder.getUserRole();
          this.userRole.set(role);

          // Marcar que la autenticación se ha verificado
          this.authChecked.next(true);
        }),
        catchError(error => {
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  logout(): void {
    this.tokenStorage.removeToken();
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.userRole.set(null);
    this.router.navigate(['/']);
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  // Verifica el tipo de token y establece el estado apropiado
  checkAuthStatus(): Observable<boolean> {
    // Si estamos en el servidor, no tenemos estado de autenticación
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    const authToken = this.tokenStorage.getToken();

    // Si no hay token de autenticación, no estamos autenticados
    if (!authToken) {
      this.isAuthenticated.set(false);
      this.authChecked.next(true);
      return of(false);
    }

    // Verificar si el token está expirado
    if (this.tokenDecoder.isTokenExpired()) {
      this.logout();
      this.authChecked.next(true);
      return of(false);
    }

    // Actualizar el rol desde el token decodificado
    const role = this.tokenDecoder.getUserRole();
    this.userRole.set(role);

    // Verificar el token con el backend
    return this.http.get<User>(`${this.apiUrl}auth/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).pipe(
      map(user => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.authChecked.next(true);
        return true;
      }),
      catchError(() => {
        this.logout();
        this.authChecked.next(true);
        return of(false);
      })
    );
  }

  // Métodos para verificar el estado actual
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated();
  }

  // Obtener tokens
  getAuthToken(): string | null {
    return this.tokenStorage.getToken();
  }

  // Métodos para verificar roles
  hasRole(role: String): boolean {
    return this.tokenDecoder.hasRole(role);
  }

  getCurrentRole(): String | null {
    return this.userRole();
  }
}
