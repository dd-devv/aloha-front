import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { GetVentasRes, PlatoVenta, Venta, VentaReq, VentaRes } from '../interfaces/venta.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para las ventas
  readonly ventas = signal<Venta[]>([]);
  readonly ventasPendientes = signal<Venta[]>([]);

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

  registrarVenta(req: VentaReq): Observable<VentaRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Venta } as VentaRes);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: VentaReq = {
      platos: req.platos,
      mesa: req.mesa
    };

    return this.http.post<VentaRes>(`${this.apiUrl}ventas`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar la nueva venta
            this.ventas.update(ventas => [...ventas, response.data]);
            this.ventasPendientes.update(ventas => [...ventas, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar venta');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarVenta(req: VentaReq, id_venta: string): Observable<VentaRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Venta } as VentaRes);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: VentaReq = {
      platos: req.platos,
      mesa: req.mesa
    };

    return this.http.put<VentaRes>(`${this.apiUrl}ventas/${id_venta}/actualizar`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar la venta actualizada
            this.ventasPendientes.update(ventas => ventas.map(venta => venta._id === id_venta ? { ...venta, ...response.data } : venta));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar venta');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  cencelarVenta(id_venta: string): Observable<VentaRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Venta } as VentaRes);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.put<VentaRes>(`${this.apiUrl}ventas/${id_venta}/cancelar`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el plato del arreglo existente
            this.ventas.update(ventas => ventas.filter(venta => venta._id !== id_venta));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al eliminar plato');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerVentas(): Observable<GetVentasRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetVentasRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetVentasRes>(`${this.apiUrl}ventas`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.ventas.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener ventas');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerVentasMozo(): Observable<GetVentasRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetVentasRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetVentasRes>(`${this.apiUrl}ventas/mozo/pendientes`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.ventasPendientes.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener ventas');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }
}
