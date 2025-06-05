import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Gasto, GastoReq, GastoRes, GastosRes } from '../interfaces';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los gastos
  readonly gastos = signal<Gasto[]>([]);
  readonly gastosNoInc = signal<Gasto[]>([]);

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

  registrarGasto(req: GastoReq): Observable<GastoRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Gasto } as GastoRes);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: GastoReq = {
      concepto: req.concepto,
      monto: req.monto
    };

    return this.http.post<GastoRes>(`${this.apiUrl}gasto`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo gasto al arreglo existente
            this.gastos.update(gastos => [...gastos, response.data]);
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

  obtenerGastos(): Observable<GastosRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GastosRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GastosRes>(`${this.apiUrl}gasto`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.gastos.set(response.data);
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

  obtenergastosNoIncluidas(): Observable<GastosRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GastosRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GastosRes>(`${this.apiUrl}gasto/cierre/no_incluidas`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.gastosNoInc.set(response.data);
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

  eliminargasto(id_gasto: string): Observable<GastoRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Gasto } as GastoRes);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<GastoRes>(`${this.apiUrl}gasto/${id_gasto}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el gasto del arreglo existente
            this.gastos.update(gastos => gastos.filter(gasto => gasto._id !== id_gasto));
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
