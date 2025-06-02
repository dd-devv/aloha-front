import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { NotaVentaService } from '../../../../services/nota-venta.service';
import { Tag } from 'primeng/tag';
import { AlmacenService } from '../../../../services/almacen.service';
import { PanelModule } from 'primeng/panel';
import { CierreCajaService } from '../../../../services/cierre-caja.service';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { RouterLink } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
@Component({
  selector: 'app-notas-venta',
  imports: [
    FieldsetModule,
    TableModule,
    CurrencyPipe,
    Button,
    ToastModule,
    FormsModule,
    InputGroupAddonModule,
    InputTextModule,
    DatePipe,
    Tag,
    PanelModule,
    Dialog,
    Message,
    RouterLink,
    DatePicker
  ],
  providers: [MessageService],
  templateUrl: './cierre-caja.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CierreCajaComponent implements OnInit {
  private notaVentaService = inject(NotaVentaService);
  private almacenService = inject(AlmacenService);
  private cierreCajaService = inject(CierreCajaService);
  private messageService = inject(MessageService);

  notaVentas = this.notaVentaService.notasVentaNoInc;
  cierresCaja = this.cierreCajaService.cierresCaja;
  movimientosinventario = this.almacenService.movimientosNoInc;
  loading = this.notaVentaService.loading;
  loadingMovimientos = this.almacenService.loading;
  loadingCierres = this.cierreCajaService.loading;

  fechaCierre = new Date();

  visible: boolean = false;

  ngOnInit(): void {
    this.obtenerNotaVentas();
    this.cargarMovimientos();
    this.cargarCierres();
  }

  obtenerNotaVentas() {
    this.notaVentaService.obtenerNotasVentaNoincluidas().subscribe({
      error: (err) => {
        console.error('Error al cargar notas venta:', err);
      }
    });
  }

  cargarMovimientos(): void {
    this.almacenService.obtenerMovimientosNoIncluidas().subscribe({
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
      }
    });
  }

  cargarCierres(): void {
    this.cierreCajaService.obtenerCierrescaja().subscribe({
      error: (err) => {
        console.error('Error al cargar cierres:', err);
      }
    });
  }

  showDialog() {
    this.visible = true;
  }

  dscargarPdfNotaVenta(codigo: string) {
    this.notaVentaService.obtenerPdfNotaVenta(codigo).subscribe({
      next: (pdfBlob) => {
        this.notaVentaService.descargarPdf(pdfBlob, `nota-venta-${codigo}.pdf`);
      },
      error: (err) => {
        console.error('Error al obtener el PDF:', err);
      }
    });
  }

  registrarCierre(): void {
    this.cierreCajaService.registrarCierreCaja(this.formatearFecha())
      .subscribe({
        next: (response) => {
          this.obtenerNotaVentas();
          this.cargarMovimientos();
          this.cargarCierres();
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Caja cerrado', life: 3000 });
          this.visible = false;
        },
        error: (err) => {
          console.error('Error al cerrar caja:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cerrar caja', life: 3000 });
        }
      });
  }

  private formatearFecha(): string {
    const año = this.fechaCierre.getFullYear();
    const mes = String(this.fechaCierre.getMonth() + 1).padStart(2, '0');
    const dia = String(this.fechaCierre.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

}
