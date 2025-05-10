import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { GetPlatosResp, Plato, PlatoRequest, PlatoResp } from '../interfaces/plato.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatosService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los platos
  readonly platos = signal<Plato[]>([]);

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

  registrarPlato(req: PlatoRequest): Observable<PlatoResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Plato } as PlatoResp);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: PlatoRequest = {
      nombre: req.nombre,
      precio: req.precio,
      codigo: req.codigo,
      galeria: req.galeria,
      tipo: req.tipo
    };

    return this.http.post<PlatoResp>(`${this.apiUrl}platos`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo usuario al arreglo existente
            this.platos.update(platos => [...platos, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar plato');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarPlato(req: PlatoRequest, id_plato: string): Observable<PlatoResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Plato } as PlatoResp);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: PlatoRequest = {
      nombre: req.nombre,
      precio: req.precio,
      codigo: req.codigo,
      galeria: req.galeria,
      tipo: req.tipo,
      estado: req.estado
    };

    return this.http.put<PlatoResp>(`${this.apiUrl}platos/${id_plato}`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo plato al arreglo existente
            this.platos.update(plato => plato.map(plato => plato._id === id_plato ? { ...plato, ...updateData } : plato));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar plato');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarPlato(id_plato: string): Observable<PlatoResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Plato } as PlatoResp);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<PlatoResp>(`${this.apiUrl}platos/${id_plato}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el plato del arreglo existente
            this.platos.update(platos => platos.filter(plato => plato._id !== id_plato));
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

  obtenerPlatos(): Observable<GetPlatosResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetPlatosResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetPlatosResp>(`${this.apiUrl}platos`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.platos.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener platos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  // Método para agregar un plato manualmente al array de platos
  agregarPlato(plato: Plato): void {
    this.platos.update(platos => [...platos, plato]);
  }
}
