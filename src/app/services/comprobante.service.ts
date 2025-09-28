import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ComprobanteData, DataSerieCorrelative, DataSunat, GetComprobantesResp, InsertSunatResp, LatestSerieCorrelativeResp, Pagination } from '../interfaces';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los gastos
  readonly comprobanteSunat = signal<DataSunat>({} as DataSunat);
  readonly comprobanteLocal = signal<any>({});
  readonly latestSerieCorrelative = signal<DataSerieCorrelative>({} as DataSerieCorrelative);

  readonly boletas = signal<ComprobanteData[]>([]);
  readonly facturas = signal<ComprobanteData[]>([]);
  readonly pagination = signal<Pagination>({} as Pagination);

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

  obtenerUltimoCorrelativo(tipo_documento: string): Observable<LatestSerieCorrelativeResp> {

    if (isPlatformServer(this.platformId)) {
      return of({} as LatestSerieCorrelativeResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<LatestSerieCorrelativeResp>(`${this.apiUrl}comprobante/obtener-ultimo-correlativo`, { tipo_documento }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.latestSerieCorrelative.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener cliente');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  insertarComprobanteSunat(data: any): Observable<InsertSunatResp> {

    if (isPlatformServer(this.platformId)) {
      return of({} as InsertSunatResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<InsertSunatResp>(`${this.apiUrl}api-sunat/insertar`, data, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.comprobanteSunat.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al insertar comprobante en Sunat');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  insertarComprobanteLocal(data: any): Observable<any> {

    if (isPlatformServer(this.platformId)) {
      return of({});
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<any>(`${this.apiUrl}comprobante/insertar`, data, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.comprobanteLocal.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al insertar comprobante local');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerBoletasEmitidas(page: number, items: number): Observable<GetComprobantesResp> {

    if (isPlatformServer(this.platformId)) {
      return of({} as GetComprobantesResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetComprobantesResp>(`${this.apiUrl}comprobante/obtener-comprobantes/03/${page}/${items}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.boletas.set(response.data);
            this.pagination.set(response.pagination);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener boletas');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerFacturasEmitidas(page: number, items: number): Observable<GetComprobantesResp> {

    if (isPlatformServer(this.platformId)) {
      return of({} as GetComprobantesResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetComprobantesResp>(`${this.apiUrl}comprobante/obtener-comprobantes/01/${page}/${items}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.facturas.set(response.data);
            this.pagination.set(response.pagination);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener boletas');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

}
