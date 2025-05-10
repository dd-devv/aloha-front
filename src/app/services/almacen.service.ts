import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Movimiento, MovimientoReq, MovimientoRes, MovimientosRes } from '../interfaces/movimiento.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los movimientos
  readonly movimientos = signal<Movimiento[]>([]);

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

  registrarMovimiento(req: MovimientoReq): Observable<MovimientoRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Movimiento } as MovimientoRes);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: MovimientoReq = {
      producto: req.producto,
      cantidad: req.cantidad,
      tipo: req.tipo.toLowerCase()
    };

    return this.http.post<MovimientoRes>(`${this.apiUrl}inventario`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo usuario al arreglo existente
            this.movimientos.update(movimientos => [...movimientos, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar movimiento');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerMovimientos(): Observable<MovimientosRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as MovimientosRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<MovimientosRes>(`${this.apiUrl}inventario`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.movimientos.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener movimientos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarMovimiento(id_movimiento: string): Observable<MovimientoRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Movimiento } as MovimientoRes);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<MovimientoRes>(`${this.apiUrl}inventario/${id_movimiento}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el movimiento del arreglo existente
            this.movimientos.update(movimientos => movimientos.filter(movimiento => movimiento._id !== id_movimiento));
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

}
