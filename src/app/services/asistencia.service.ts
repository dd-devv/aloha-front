import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Asistencia, AsistenciaReq, AsistenciaResp, GetAsistenciasResp } from '../interfaces';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para las asistencias
  readonly asistencias = signal<Asistencia[]>([]);
  readonly asistenciasTrabajador = signal<Asistencia[]>([]);

  // Controlar si está cargando datos
  readonly loading = signal<boolean>(false);
  readonly loadingTrabajador = signal<boolean>(false);

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

  registrarAsistencia(req: AsistenciaReq): Observable<AsistenciaResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Asistencia } as AsistenciaResp);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: AsistenciaReq = {
      trabajador: req.trabajador,
      fechaEntrada: req.fechaEntrada
    };

    return this.http.post<AsistenciaResp>(`${this.apiUrl}asistencias`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo usuario al arreglo existente
            this.asistencias.update(asistencias => [...asistencias, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar asistencia');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerAsistencias(fecha: Date): Observable<GetAsistenciasResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetAsistenciasResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetAsistenciasResp>(`${this.apiUrl}asistencias/fecha/${fecha.toISOString()}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.asistencias.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener asistencias');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerAsistenciasTrabajador(id_trabajador: String): Observable<GetAsistenciasResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetAsistenciasResp);
    }

    this.loadingTrabajador.set(true);
    this.error.set(null);

    return this.http.get<GetAsistenciasResp>(`${this.apiUrl}asistencias/trabajador/${id_trabajador}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.asistenciasTrabajador.set(response.data);
          }
          this.loadingTrabajador.set(false);
        }),
        catchError(error => {
          this.loadingTrabajador.set(false);
          this.error.set(error.error || 'Error al obtener asistencias');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }
}
