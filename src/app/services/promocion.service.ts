import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { GetPromocionesRes, Promocion, PromocionReq, PromocionResp } from '../interfaces/promocion.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los usuarios
  readonly promociones = signal<Promocion[]>([]);

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

  registrarPromocion(req: PromocionReq): Observable<PromocionResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Promocion } as PromocionResp);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: PromocionReq = {
      codigo: req.codigo,
      descuento: req.descuento,
      montoMinimo: req.montoMinimo,
      fechaInicio: req.fechaInicio,
      fechaFin: req.fechaFin
    };

    return this.http.post<PromocionResp>(`${this.apiUrl}promociones`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo promocion al arreglo existente
            this.promociones.update(promociones => [...promociones, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar promoción');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarPromocion(req: PromocionReq, id_promocion: string): Observable<PromocionResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Promocion } as PromocionResp);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: PromocionReq = {
      codigo: req.codigo,
      descuento: req.descuento,
      montoMinimo: req.montoMinimo,
      fechaInicio: req.fechaInicio,
      fechaFin: req.fechaFin
    };

    return this.http.put<PromocionResp>(`${this.apiUrl}promociones/${id_promocion}`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo promocion al arreglo existente
            this.promociones.update(promocion => promocion.map(promocion => promocion._id === id_promocion ? { ...promocion, ...updateData } : promocion));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar promocion');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerPromocionCode(codigo: string, monto: number): Observable<PromocionResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Promocion } as PromocionResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<PromocionResp>(`${this.apiUrl}promociones/vigentes/${codigo}/${monto}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener promoción');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarPromocion(id_promocion: string): Observable<PromocionResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Promocion } as PromocionResp);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<PromocionResp>(`${this.apiUrl}promociones/${id_promocion}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el promocion del arreglo existente
            this.promociones.update(promociones => promociones.filter(promocion => promocion._id !== id_promocion));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al eliminar promoción');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerPromociones(): Observable<GetPromocionesRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetPromocionesRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetPromocionesRes>(`${this.apiUrl}promociones`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.promociones.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener promociones');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  // Método para agregar una promoción manualmente al array de promociones
  agregarPromocion(promocion: Promocion): void {
    this.promociones.update(promociones => [...promociones, promocion]);
  }
}
