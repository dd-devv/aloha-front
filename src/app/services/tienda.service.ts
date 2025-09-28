import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Tienda, TiendaReq, TiendaResp } from '../interfaces/tienda.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Observable, of, tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TiendaService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los usuarios
  readonly tienda = signal<Tienda>({} as Tienda);

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

  registrarTienda(req: TiendaReq): Observable<TiendaResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Tienda } as TiendaResp);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: TiendaReq = {
      nombre: req.nombre,
      direccion: req.direccion,
      telefono: req.telefono,
      whatsapp: req.whatsapp,
      horaEntrada: req.horaEntrada,
      tolerancia: req.tolerancia,
      numeroMesas: req.numeroMesas,
      logo: req.logo
    };

    return this.http.post<TiendaResp>(`${this.apiUrl}tienda`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.success) {
            // Agregar tienda al existente
            this.tienda.update(() => response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar tienda');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarTienda(req: TiendaReq): Observable<TiendaResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Tienda } as TiendaResp);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: TiendaReq = {
      nombre: req.nombre,
      direccion: req.direccion,
      telefono: req.telefono,
      whatsapp: req.whatsapp,
      horaEntrada: req.horaEntrada,
      tolerancia: req.tolerancia,
      numeroMesas: req.numeroMesas,
      logo: req.logo
    };

    return this.http.put<TiendaResp>(`${this.apiUrl}tienda`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar los nuevos datos de tienda
            this.tienda.update(() => response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar tienda');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarGaleriaTienda(gallery: string[]): Observable<TiendaResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Tienda } as TiendaResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.put<TiendaResp>(`${this.apiUrl}tienda/gallery`, { gallery }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar los nuevos datos de tienda
            this.tienda.update(() => response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar galería');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerTienda(): Observable<TiendaResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: {} } as TiendaResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<TiendaResp>(`${this.apiUrl}tienda`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.tienda.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener tienda');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }
}
