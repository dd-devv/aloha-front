import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { GetVentasRes, Venta, VentaReq, VentaRes } from '../interfaces/venta.interface';
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

  confirmarVenta(promocion: string | null, id_venta: string): Observable<VentaRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Venta } as VentaRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.put<VentaRes>(`${this.apiUrl}ventas/${id_venta}/confirmar`, { promocion }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          this.ventasPendientes.update(ventas => ventas.filter(venta => venta._id !== id_venta));
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al confirmar venta');
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
            // Quitar la venta del arreglo existente
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

  obtenerVentasAdmin(): Observable<GetVentasRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetVentasRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetVentasRes>(`${this.apiUrl}ventas/admin/pendientes`, {
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

  obtenerPdfVenta(id_venta: string, width?: number): Observable<Blob> {
    if (isPlatformServer(this.platformId)) {
      return throwError(() => new Error('Operación no disponible en SSR'));
    }

    // Configurar los headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Accept': 'application/pdf'
    });

    // Agregar parámetro de ancho si está definido
    const params: any = {};
    if (width) {
      params.width = width.toString();
    }

    return this.http.get(`${this.apiUrl}ventas/pdf/${id_venta}`, {
      headers: headers,
      params: params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  private handleError(error: any): Error {
    // Puedes personalizar el manejo de errores aquí
    console.error('Error al obtener el PDF:', error);
    return new Error(error.error?.message || 'Error al obtener el PDF de la nota de venta');
  }

  // Método para abrir el PDF en una nueva pestaña
  abrirPdfEnNuevaPestaña(pdfBlob: Blob): void {
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  }

  // Método para descargar el PDF
  descargarPdf(pdfBlob: Blob, nombreArchivo: string): void {
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(pdfBlob);
    downloadLink.href = url;
    downloadLink.download = nombreArchivo || 'nota-venta.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
