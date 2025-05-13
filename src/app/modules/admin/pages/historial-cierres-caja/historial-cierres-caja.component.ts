import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DataCierre } from '../../../../interfaces';
import { FormsModule } from '@angular/forms';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { CierreCajaService } from '../../../../services/cierre-caja.service';

@Component({
  selector: 'app-pendientes',
  imports: [
    FieldsetModule,
    TableModule,
    CurrencyPipe,
    ToastModule,
    FormsModule,
    InputGroupAddonModule,
    InputTextModule,
    DatePipe,
    PaginationComponent,
    PaginatePipe,
  ],
  providers: [MessageService],
  templateUrl: './historial-cierres-caja.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HistorialCierresCajaComponent implements OnInit {
  private cierreCajaService = inject(CierreCajaService);
  private platformId = inject(PLATFORM_ID);

  cierresCaja = this.cierreCajaService.cierresCaja;
  cierresCajaFiltradas = signal<DataCierre[]>([])
  loading = this.cierreCajaService.loading;

  //Para paginacion
  currentPage = 1;
  pageSize = 6;

  ngOnInit(): void {
    this.obtenerCierres();
  }

  obtenerCierres() {
    this.cierreCajaService.obtenerCierrescaja().subscribe({
      next: (res) => {
        this.cierresCajaFiltradas.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar cierres:', err);
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.cierresCajaFiltradas().length / this.pageSize);
  }

  onPageChange(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }

}
