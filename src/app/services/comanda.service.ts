import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Comanda, DatumComanda, GetComandasRes, UpdateComandaReq, UpdateComandaRes } from '../interfaces/comanda.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComandaService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para las comandas
  readonly comandas = signal<Comanda[]>([]);
  readonly comandasAll = signal<DatumComanda[]>([]);

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

  actualizarComanda(estado: string, id_comanda: string): Observable<UpdateComandaRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Comanda } as UpdateComandaRes);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: UpdateComandaReq = {
      estado
    };

    return this.http.put<UpdateComandaRes>(`${this.apiUrl}comandas/${id_comanda}/estado`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar la comanda actualizada
            this.comandas.update(comandas => comandas.map(comanda => comanda._id === id_comanda ? { ...comanda, ...response.data } : comanda));
            this.comandasAll.update((data: DatumComanda[]) =>
              data.map(datum => ({
                ...datum,
                comandas: datum.comandas.map(comanda =>
                  comanda._id === id_comanda ? { ...comanda, ...response.data } : comanda
                )
              }))
            );
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar comanda');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerComandas(): Observable<GetComandasRes> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetComandasRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetComandasRes>(`${this.apiUrl}comandas/pendientes`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.comandasAll.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener comandas');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }
}
