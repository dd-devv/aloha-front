import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { VentaService } from '../../../../services/venta.service';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { NotaVentaService } from '../../../../services/nota-venta.service';

@Component({
  selector: 'app-flujo-caja',
  standalone: true,
  imports: [
    FieldsetModule,
    TableModule,
    CurrencyPipe,
    ButtonModule,
    FormsModule,
    DatePicker,
    DatePipe
  ],
  templateUrl: './flujo-caja.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FlujoCajaComponent implements OnInit {

  private ventaService = inject(VentaService);
  private nVentaService = inject(NotaVentaService);

  flujoCaja = this.ventaService.flujoCaja;
  loadingFlujo = this.ventaService.loading;

  fechaInicio!: Date;
  fechaFin!: Date;

  // Para el formato que se enviará al servicio
  inicio!: string;
  fin!: string;

  // Para manejar la fecha máxima permitida
  maxDate: Date = new Date();

  constructor() {
    this.configurarFechasIniciales();
  }

  ngOnInit(): void {
    this.obtenerFlujoCaja();
  }

  /**
   * Configura las fechas iniciales y la fecha máxima según la hora actual
   */
  private configurarFechasIniciales(): void {
    const ahora = new Date();
    const horaActual = ahora.getHours();

    // Establecer fecha máxima según la regla de negocio
    this.maxDate = new Date();
    if (horaActual < 18) { // Antes de las 6 PM
      // Solo se puede seleccionar hasta ayer
      this.maxDate.setDate(this.maxDate.getDate() - 1);
    }
    // Si es después de las 6 PM, maxDate queda como hoy

    // Establecer fechas por defecto
    this.fechaInicio = new Date(this.maxDate);
    this.fechaFin = new Date(this.maxDate);

    // Convertir al formato requerido
    this.inicio = this.formatDate(this.fechaInicio);
    this.fin = this.formatDate(this.fechaFin);
  }

  private actualizarFechaMaxima(): void {
    const ahora = new Date();
    const horaActual = ahora.getHours();

    this.maxDate = new Date();
    if (horaActual < 18) {
      this.maxDate.setDate(this.maxDate.getDate() - 1);
    }
  }

  /**
   * Formatea una fecha como YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Maneja el cambio en la fecha de inicio
   */
  onFechaInicioChange(event: any): void {
    this.actualizarFechaMaxima(); // Actualizar restricciones

    this.fechaInicio = event;
    this.inicio = this.formatDate(this.fechaInicio);

    // Si la fecha de fin es anterior a la de inicio, ajustarla
    if (this.fechaFin < this.fechaInicio) {
      this.fechaFin = new Date(this.fechaInicio);
      this.fin = this.formatDate(this.fechaFin);
    }

    this.obtenerFlujoCaja();
  }

  /**
   * Maneja el cambio en la fecha de fin
   */
  onFechaFinChange(event: any): void {
    this.actualizarFechaMaxima(); // Actualizar restricciones

    this.fechaFin = event;
    this.fin = this.formatDate(this.fechaFin);

    // Si la fecha de inicio es posterior a la de fin, ajustarla
    if (this.fechaInicio > this.fechaFin) {
      this.fechaInicio = new Date(this.fechaFin);
      this.inicio = this.formatDate(this.fechaInicio);
    }

    this.obtenerFlujoCaja();
  }

  /**
   * Verifica si las fechas son iguales (mismo día)
   */
  private sonFechasIguales(): boolean {
    return this.inicio === this.fin;
  }

  /**
   * Obtiene el flujo de caja del backend
   */
  obtenerFlujoCaja() {

    this.ventaService.obtenerFlujoCaja(this.inicio, this.fin).subscribe({
      error: (err) => {
        console.error('Error al cargar flujo de caja:', err);
      }
    });
  }

  /**
   * Método para obtener las llaves (números de mesa) de un objeto ingresosPorMesa
   */
  getMesasKeys(ingresosPorMesa: { [key: string]: number }): string[] {
    return Object.keys(ingresosPorMesa);
  }

  /**
   * Exporta el reporte en formato PDF
   */
  exportarPdf() {
    this.nVentaService.obtenerPdfReportes(this.flujoCaja()).subscribe({
      next: (pdfBlob) => {
        const nombreArchivo = this.sonFechasIguales()
          ? `reporte-${this.inicio}.pdf`
          : `reporte-${this.inicio}-${this.fin}.pdf`;

        this.nVentaService.descargarPdf(pdfBlob, nombreArchivo);
      },
      error: (err) => {
        console.error('Error al obtener el PDF:', err);
      }
    });
  }

  /**
   * Exporta el reporte en formato Excel
   */
  exportarXls() {
    this.nVentaService.obtenerExcelReportes(this.flujoCaja()).subscribe({
      next: (excelBlob) => {
        const nombreArchivo = this.sonFechasIguales()
          ? `reporte-${this.inicio}.xlsx`
          : `reporte-${this.inicio}-${this.fin}.xlsx`;

        this.nVentaService.descargarXls(excelBlob, nombreArchivo);
      },
      error: (err) => {
        console.error('Error al obtener el XLS:', err);
      }
    });
  }

  /**
   * Método auxiliar para obtener información de estado de las fechas
   */
  getInfoFechas(): { tipo: string, descripcion: string } {
    if (this.sonFechasIguales()) {
      return {
        tipo: 'día único',
        descripcion: `Mostrando ventas del día de negocio ${this.inicio} (incluyendo madrugada del día siguiente hasta las 8:00 AM)`
      };
    } else {
      return {
        tipo: 'rango',
        descripcion: `Mostrando ventas desde ${this.inicio} hasta ${this.fin}`
      };
    }
  }

  /**
   * Método para establecer fecha de hoy (si está permitido)
   */
  seleccionarHoy(): void {
    const ahora = new Date();
    if (ahora <= this.maxDate) {
      this.fechaInicio = new Date(ahora);
      this.fechaFin = new Date(ahora);
      this.inicio = this.formatDate(this.fechaInicio);
      this.fin = this.formatDate(this.fechaFin);
      this.obtenerFlujoCaja();
    }
  }

  /**
   * Método para establecer fecha de ayer
   */
  seleccionarAyer(): void {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    this.fechaInicio = new Date(ayer);
    this.fechaFin = new Date(ayer);
    this.inicio = this.formatDate(this.fechaInicio);
    this.fin = this.formatDate(this.fechaFin);
    this.obtenerFlujoCaja();
  }

  /**
   * Verifica si se puede seleccionar el día actual
   */
  puedeSeleccionarHoy(): boolean {
    const ahora = new Date();
    return ahora.getHours() >= 18;
  }
}
