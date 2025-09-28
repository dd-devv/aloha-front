import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { NotasVentaRes, NotaVenta } from '../interfaces/notaVenta.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { DataFlujo, Pagination } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class NotaVentaService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  // Signal para los usuarios
  readonly notasVenta = signal<NotaVenta[]>([]);
  readonly notasVentaNoInc = signal<NotaVenta[]>([]);
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

  obtenerPdfNotaVenta(codigo: string, width?: number): Observable<Blob> {
    if (isPlatformServer(this.platformId)) {
      return throwError(() => new Error('Operación no disponible en SSR'));
    }

    // Configurar los headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Accept': 'application/pdf'
    });

    // Agregar parámetro de ancho si está definido
    const params: any = {};
    if (width) {
      params.width = width.toString();
    }

    return this.http.get(`${this.apiUrl}notas-venta/pdf/${codigo}`, {
      headers: headers,
      params: params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  private handleError(error: any): Error {
    // Puedes personalizar el manejo de errores aquí
    console.error('Error al obtener el PDF:', error);
    return new Error(error.error?.message || 'Error al obtener el PDF de la nota de venta');
  }

  // Método para abrir el PDF en una nueva pestaña
  abrirPdfEnNuevaPestaña(pdfBlob: Blob): void {
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  }

  // Método para descargar el PDF
  descargarPdf(pdfBlob: Blob, nombreArchivo: string): void {
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(pdfBlob);
    downloadLink.href = url;
    downloadLink.download = nombreArchivo || 'nota-venta.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Método para descargar en xls
  descargarXls(pdfBlob: Blob, nombreArchivo: string): void {
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(pdfBlob);
    downloadLink.href = url;
    downloadLink.download = nombreArchivo || 'nota-venta.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  obtenerNotasVenta(page: number, items: number): Observable<NotasVentaRes> {

    if (isPlatformServer(this.platformId)) {
      return of({} as NotasVentaRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<NotasVentaRes>(`${this.apiUrl}notas-venta/${page}/${items}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.notasVenta.set(response.data);
            this.pagination.set(response.pagination);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener notas de venta');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerNotasVentaNoincluidas(): Observable<NotasVentaRes> {

    if (isPlatformServer(this.platformId)) {
      return of({} as NotasVentaRes);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<NotasVentaRes>(`${this.apiUrl}notas-venta/cierre/no_incluidas`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
      .pipe(
        tap(response => {
          if (response.data) {
            this.notasVentaNoInc.set(response.data);
          }
          this.loading.set(false);
        }),
        catchError(error => {
          this.loading.set(false);
          this.error.set(error.error || 'Error al obtener notas de venta');
          return throwError(() => ({
            error: error.error
          }));
        })
      );
  }

  obtenerPdfReportes(data: DataFlujo): Observable<Blob> {
    if (isPlatformServer(this.platformId)) {
      return throwError(() => new Error('Operación no disponible en SSR'));
    }

    // Configurar los headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Accept': 'application/pdf'
    });

    // Agregar parámetro de ancho si está definido
    const params: any = {};


    return this.http.post(`${this.apiUrl}notas-venta/reportes/pdf`, { data }, {
      headers: headers,
      params: params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  obtenerExcelReportes(data: DataFlujo): Observable<Blob> {
    if (isPlatformServer(this.platformId)) {
      return throwError(() => new Error('Operación no disponible en SSR'));
    }

    // Configurar los headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Agregar parámetro de ancho si está definido
    const params: any = {};


    return this.http.post(`${this.apiUrl}notas-venta/reportes/excel`, { data }, {
      headers: headers,
      params: params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        return throwError(() => this.handleError(error));
      })
    );
  }
}
