import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { CierreCajaRes, DataCierre, GetCierresCaja } from '../interfaces/cierreCaja.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CierreCajaService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los cierres de caja
  readonly cierresCaja = signal<DataCierre[]>([]);

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

  registrarCierreCaja(): Observable<DataCierre> {

    if (isPlatformServer(this.platformId)) {
      return of({} as DataCierre);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.post<DataCierre>(`${this.apiUrl}cierre-caja`, { data: true }, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          this.cierresCaja.update(cierre => [...cierre, response]);
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al cerrar caja');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerCierrescaja(): Observable<GetCierresCaja> {

    if (isPlatformServer(this.platformId)) {
      return of({} as GetCierresCaja);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetCierresCaja>(`${this.apiUrl}cierre-caja`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.cierresCaja.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener cierres');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }
}
