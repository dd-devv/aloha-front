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

  fechaInicio: Date;
  fechaFin: Date;

  // Para el formato que se enviará al servicio
  inicio: string;
  fin: string;

  // Para manejar la fecha máxima permitida
  maxDate: Date = new Date();

  constructor() {
    // Establecer fecha de inicio (día anterior)
    this.fechaInicio = new Date();
    this.fechaInicio.setDate(this.fechaInicio.getDate() - 1);

    // Configurar la fecha máxima como un día después del actual
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 1);

    // Establecer fecha fin (día después del actual)
    this.fechaFin = new Date();
    this.fechaFin.setDate(this.fechaFin.getDate() + 1);

    // Convertir las fechas al formato requerido (YYYY-MM-DD)
    this.inicio = this.formatDate(this.fechaInicio);
    this.fin = this.formatDate(this.fechaFin);
  }

  ngOnInit(): void {
    this.obtenerFlujoCaja();
  }

  // Método para formatear fecha como YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Método para manejar cambio en fecha inicio
  onFechaInicioChange(event: any): void {
    this.fechaInicio = event;
    this.inicio = this.formatDate(this.fechaInicio);
    this.obtenerFlujoCaja();
  }

  // Método para manejar cambio en fecha fin
  onFechaFinChange(event: any): void {
    this.fechaFin = event;
    this.fin = this.formatDate(this.fechaFin);
    this.obtenerFlujoCaja();
  }

  obtenerFlujoCaja() {
    this.ventaService.obtenerFlujoCaja(this.inicio, this.fin).subscribe({
      error: (err) => {
        console.error('Error al cargar flujo de caja:', err);
      }
    });
  }

  // Método para obtener las llaves (números de mesa) de un objeto ingresosPorMesa
  getMesasKeys(ingresosPorMesa: { [key: string]: number }): string[] {
    return Object.keys(ingresosPorMesa);
  }

  exportarPdf() {
    this.nVentaService.obtenerPdfReportes(this.flujoCaja()).subscribe({
      next: (pdfBlob) => {

        this.nVentaService.descargarPdf(pdfBlob, `reportes-ventas.pdf`);
      },
      error: (err) => {
        console.error('Error al obtener el PDF:', err);
      }
    });
  }

  exportarXls() {
    this.nVentaService.obtenerExcelReportes(this.flujoCaja()).subscribe({
      next: (pdfBlob) => {

        this.nVentaService.descargarXls(pdfBlob, `reportes-ventas.xlsx`);
      },
      error: (err) => {
        console.error('Error al obtener el XLS:', err);
      }
    });
  }
}
