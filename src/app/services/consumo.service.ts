import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { DataGasto, GPReq, GPRes, GPsRes } from '../interfaces/gastoPersonal.interfaces';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { ConsumoReq, ConsumoRes, DataConsumo, GetConsumosResp } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ConsumoService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los gastos
  readonly gastosPersonal = signal<DataGasto[]>([]);
  readonly consumosPersonal = signal<DataConsumo[]>([]);
  gastosPersonalUser = signal<DataGasto[]>([]);
  consumosPersonalUser = signal<DataConsumo[]>([]);

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

  registrarGastoPersonal(req: GPReq): Observable<GPRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as DataGasto } as GPRes);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: GPReq = {
      concepto: req.concepto,
      monto: req.monto,
      empleado: req.empleado
    };

    return this.http.post<GPRes>(`${this.apiUrl}gasto-personal`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo gasto al arreglo existente
            this.gastosPersonal.update(gastos => [...gastos, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar gasto');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerGastosPersonales(): Observable<GPsRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GPsRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GPsRes>(`${this.apiUrl}gasto-personal`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.gastosPersonal.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener gastos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerGastosPersonalesUser(userId: string): Observable<GPsRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GPsRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GPsRes>(`${this.apiUrl}gasto-personal/${userId}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.gastosPersonalUser.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener gastos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarGastosPersonales(userId: string): Observable<GPsRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GPsRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<GPsRes>(`${this.apiUrl}gasto-personal/${userId}`, { data: true }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.gastosPersonalUser.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar gastos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarGastoPersonal(id_gasto: string): Observable<GPRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as DataGasto } as GPRes);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<GPRes>(`${this.apiUrl}gasto-personal/${id_gasto}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el gasto del arreglo existente
            this.gastosPersonal.update(gastos => gastos.filter(gasto => gasto._id !== id_gasto));
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

  registrarConsumoPersonal(req: ConsumoReq): Observable<ConsumoRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as DataConsumo } as ConsumoRes);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: ConsumoReq = {
      platos: req.platos,
      empleadoId: req.empleadoId
    };

    return this.http.post<ConsumoRes>(`${this.apiUrl}consumo`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar la nueva venta
            this.consumosPersonal.update(ventas => [...ventas, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar el consumo');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerConsumosPersonal(): Observable<GetConsumosResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetConsumosResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetConsumosResp>(`${this.apiUrl}consumo`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.consumosPersonal.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener consumos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerConsumosPersonalUser(userId: string): Observable<GetConsumosResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetConsumosResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetConsumosResp>(`${this.apiUrl}consumo/${userId}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.consumosPersonalUser.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener consumos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarConsumosPersonal(userId: string): Observable<GetConsumosResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetConsumosResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<GetConsumosResp>(`${this.apiUrl}consumo/${userId}`, { data: true }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.consumosPersonalUser.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar consumos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarConsumoPersonal(consumoId: string): Observable<GetConsumosResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: [] } as GetConsumosResp);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<GetConsumosResp>(`${this.apiUrl}consumo/${consumoId}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar la venta del arreglo existente
            this.consumosPersonal.update(consumos => consumos.filter(consumo => consumo._id !== consumoId));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al eliminar consumo');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

}
