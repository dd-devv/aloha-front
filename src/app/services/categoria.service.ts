import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Categoria, CategoriaRegisterReq, CategoriaResponse, GetCategoriasResp } from '../interfaces/categoria.interfaces';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService  {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los usuarios
  readonly categorias = signal<Categoria[]>([]);
  readonly categoriasPublic = signal<Categoria[]>([]);

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

  registrarCategoria(req: CategoriaRegisterReq): Observable<CategoriaResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Categoria } as CategoriaResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: CategoriaRegisterReq = {
      descripcion: req.descripcion
    };

    return this.http.post<CategoriaResponse>(`${this.apiUrl}categorias`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar la categoria al arreglo existente
            this.categorias.update(categorias => [...categorias, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar categoría');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarCategoria(req: CategoriaRegisterReq, id_categoria: string): Observable<CategoriaResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Categoria } as CategoriaResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: CategoriaRegisterReq = {
      descripcion: req.descripcion
    };

    return this.http.put<CategoriaResponse>(`${this.apiUrl}categorias/${id_categoria}`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar la nueva categoria al arreglo existente
            this.categorias.update(product => product.map(product => product._id === id_categoria ? { ...product, ...updateData } : product));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar categoría');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarCategoria(id_categoria: string): Observable<CategoriaResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Categoria } as CategoriaResponse);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<CategoriaResponse>(`${this.apiUrl}categorias/${id_categoria}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar la categoria del arreglo existente
            this.categorias.update(categorias => categorias.filter(categoria => categoria._id !== id_categoria));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al eliminar categoría');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerCategorias(): Observable<GetCategoriasResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetCategoriasResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetCategoriasResp>(`${this.apiUrl}categorias`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.categorias.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener categorías');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerCategoriasPublic(): Observable<GetCategoriasResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetCategoriasResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetCategoriasResp>(`${this.apiUrl}categorias/first`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.categoriasPublic.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener categorías');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }
}
