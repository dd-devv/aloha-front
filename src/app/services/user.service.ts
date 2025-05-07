import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { GetUsersResponse, RegisterResponse, RegisterUserRequest, UpdatePasswordReq, UpdateUserRequest, User } from '../interfaces';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los usuarios
  readonly users = signal<User[]>([]);

  // Controlar si está cargando datos
  readonly loading = signal<boolean>(false);

  // Controlar errores
  readonly error = signal<any>(null);

  public authToken: string | null;

  constructor() {
    // Verificar si estamos en el navegador antes de acceder al localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.authToken = this.tokenStorage.getToken();
    } else {
      // En SSR no tenemos localStorage
      this.authToken = null;
    }
  }

  registrarUsuario(req: RegisterUserRequest): Observable<RegisterResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as User } as RegisterResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: RegisterUserRequest = {
      nombres: req.nombres,
      apellidos: req.apellidos,
      username: req.username,
      password: req.password,
      role: req.role
    };

    return this.http.post<RegisterResponse>(`${this.apiUrl}users`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo usuario al arreglo existente
            this.users.update(users => [...users, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar usuario');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarUsuario(req: UpdateUserRequest, id_user: string): Observable<RegisterResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as User } as RegisterResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: UpdateUserRequest = {
      nombres: req.nombres,
      apellidos: req.apellidos,
      role: req.role
    };

    return this.http.put<RegisterResponse>(`${this.apiUrl}users/${id_user}`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo usuario al arreglo existente
            this.users.update(users => users.map(user => user._id === id_user ? { ...user, ...updateData } : user));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar usuario');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarPassword(req: UpdatePasswordReq): Observable<RegisterResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as User } as RegisterResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateDataPass: UpdatePasswordReq = {
      newPassword: req.newPassword,
      userId: req.userId
    };

    return this.http.post<RegisterResponse>(`${this.apiUrl}auth/change-password`, updateDataPass, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo usuario al arreglo existente
            this.users.update(users => users);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar contraseña');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarUsuario(id_user: string): Observable<RegisterResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as User } as RegisterResponse);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<RegisterResponse>(`${this.apiUrl}users/${id_user}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el usuario del arreglo existente
            this.users.update(users => users.filter(user => user._id !== id_user));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al eliminar usuario');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerUsuarios(): Observable<GetUsersResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetUsersResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetUsersResponse>(`${this.apiUrl}users`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.users.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener usuarios');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  // Método para agregar un usuario manualmente al array de usuarios
  agregarUsuario(usuario: User): void {
    this.users.update(users => [...users, usuario]);
  }
}
