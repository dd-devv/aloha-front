import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Popover } from 'primeng/popover';
import { ComprobanteService } from '../../../../../services/comprobante.service';
import { environment } from '../../../../../../environments/environment';
import { PaginationComponent } from "../../../components/pagination/pagination.component";

@Component({
  selector: 'app-facturas',
  imports: [
    Fieldset,
    Button,
    CurrencyPipe,
    Popover,
    DatePipe,
    RouterLink,
    PaginationComponent
  ],
  templateUrl: './facturas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FacturasComponent implements OnInit {
  @ViewChild('op') op!: Popover;
  private comprobanteService = inject(ComprobanteService);
  facturas = this.comprobanteService.facturas;
  loading = this.comprobanteService.loading;
  pagination = this.comprobanteService.pagination;
  error = this.comprobanteService.error;
  private platformId = inject(PLATFORM_ID);

  formats = [
    { label: 'Ticket 58mm', value: '58mm' },
    { label: 'Ticket 80mm', value: '80mm' },
    { label: 'A5', value: 'A5' },
    { label: 'A4', value: 'A4' }
  ];

  selectedFormat = '80mm';
  url_sunat = environment.url_doc_sunat;

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  ngOnInit(): void {
    this.obtenerFacturas();
  }

  obtenerFacturas(): void {
    this.comprobanteService.obtenerFacturasEmitidas(this.currentPage, this.pageSize).subscribe();
  }

  toggle(event: any) {
    this.op.toggle(event);

  }

  selectFormat(item: any, documentId: string, format: string, ruc_tienda: string, serie: string, correlativo: string) {
    this.selectedFormat = item.value;
    if (isPlatformBrowser(this.platformId)) {
      const url = `${this.url_sunat}${documentId}/getPDF/${format}/${ruc_tienda}-01-${serie}-${correlativo}.pdf`;
      window.open(url, '_blank');
    }
    this.op.hide();
  }

  onPageChange(page: number): void {
    this.comprobanteService.obtenerFacturasEmitidas(page, this.pageSize).subscribe();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }
}
