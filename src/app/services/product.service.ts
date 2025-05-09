import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { GetProductsResp, Product, ProductRegisterReq, ProductResponse } from '../interfaces';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los usuarios
  readonly products = signal<Product[]>([]);

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

  registrarProducto(req: ProductRegisterReq): Observable<ProductResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Product } as ProductResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    const registerData: ProductRegisterReq = {
      nombre: req.nombre,
      unidades: req.unidades,
      precioUnitario: req.precioUnitario,
      codigo: req.codigo,
      galeria: req.galeria
    };

    return this.http.post<ProductResponse>(`${this.apiUrl}productos`, registerData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo usuario al arreglo existente
            this.products.update(products => [...products, response.data]);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al registrar producto');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  actualizarProducto(req: ProductRegisterReq, id_product: string): Observable<ProductResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Product } as ProductResponse);
    }

    this.loading.set(true);
    this.error.set(null);

    const updateData: ProductRegisterReq = {
      nombre: req.nombre,
      unidades: req.unidades,
      precioUnitario: req.precioUnitario,
      codigo: req.codigo,
      galeria: req.galeria
    };

    return this.http.put<ProductResponse>(`${this.apiUrl}productos/${id_product}`, updateData, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Agregar el nuevo producto al arreglo existente
            this.products.update(product => product.map(product => product._id === id_product ? { ...product, ...updateData } : product));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al actualizar producto');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  eliminarProducto(id_product: string): Observable<ProductResponse> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: false, message: 'Operación no disponible en SSR', data: {} as Product } as ProductResponse);
    }

    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<ProductResponse>(`${this.apiUrl}productos/${id_product}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            // Quitar el productoo del arreglo existente
            this.products.update(products => products.filter(product => product._id !== id_product));
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al eliminar producto');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerProductos(): Observable<GetProductsResp> {

    if (isPlatformServer(this.platformId)) {
      return of({ success: true, message: '', data: [] } as GetProductsResp);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<GetProductsResp>(`${this.apiUrl}productos`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.products.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener productos');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  // Método para agregar un producto manualmente al array de productos
  agregarProducto(producto: Product): void {
    this.products.update(products => [...products, producto]);
  }
}
