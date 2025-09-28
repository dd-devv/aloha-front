import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { DNIResponse, RUCResponse } from '../interfaces/DniRuc.interfaces';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DniRucService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los gastos
  readonly clienteDNI = signal<DNIResponse>({} as DNIResponse);
  readonly clienteRUC = signal<RUCResponse>({} as RUCResponse);

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

  obtenerClienteDNI(dni: string): Observable<DNIResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({} as DNIResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DNIResponse>(`${this.apiUrl}dni/${dni}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.clienteDNI.set(response);
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

  obtenerClienteRUC(ruc: string): Observable<RUCResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({} as RUCResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<RUCResponse>(`${this.apiUrl}ruc/${ruc}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response) {
            this.clienteRUC.set(response);
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

}
