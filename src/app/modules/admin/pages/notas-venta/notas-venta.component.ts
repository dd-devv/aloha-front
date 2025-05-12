import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import {  InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { NotaVentaService } from '../../../../services/nota-venta.service';
import { NotaVenta } from '../../../../interfaces/notaVenta.interface';
import { Tag } from 'primeng/tag';
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
    Tag
  ],
  providers: [MessageService],
  templateUrl: './notas-venta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotasVentaComponent implements OnInit {
  private notaVentaService = inject(NotaVentaService);
  public url_socket = environment.url_socket;

  notaVentas = this.notaVentaService.notasVenta;
  loading = this.notaVentaService.loading;

  visible: boolean = false;

  ngOnInit(): void {
    this.obtenerNotaVentas();
  }

  obtenerNotaVentas() {
    this.notaVentaService.obtenerNotasVenta().subscribe({
      error: (err) => {
        console.error('Error al cargar notas venta:', err);
      }
    });
  }


  showDialog(venta: NotaVenta) {
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

}
