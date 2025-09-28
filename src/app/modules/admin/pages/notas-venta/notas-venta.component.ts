import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { NotaVentaService } from '../../../../services/nota-venta.service';
import { NotaVenta } from '../../../../interfaces/notaVenta.interface';
import { Tag } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from "../../components/pagination/pagination.component";
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
    RouterLink,
    PaginationComponent
],
  providers: [MessageService],
  templateUrl: './notas-venta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotasVentaComponent implements OnInit {
  private notaVentaService = inject(NotaVentaService);
  pagination = this.notaVentaService.pagination;
  private platformId = inject(PLATFORM_ID);

  notaVentas = this.notaVentaService.notasVenta;
  loading = this.notaVentaService.loading;

  visible: boolean = false;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  ngOnInit(): void {
    this.obtenerNotaVentas();
  }

  obtenerNotaVentas() {
    this.notaVentaService.obtenerNotasVenta(this.currentPage, this.pageSize).subscribe({
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

  onPageChange(page: number): void {
    this.notaVentaService.obtenerNotasVenta(page, this.pageSize).subscribe();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }
}
