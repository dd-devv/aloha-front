import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { ComprobanteService } from '../../../../../services/comprobante.service';
import { Button } from 'primeng/button';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { Popover } from 'primeng/popover';
import { environment } from '../../../../../../environments/environment';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from "../../../components/pagination/pagination.component";

@Component({
  selector: 'app-boletas',
  imports: [
    Fieldset,
    Button,
    CurrencyPipe,
    Popover,
    DatePipe,
    RouterLink,
    PaginationComponent
  ],
  templateUrl: './boletas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoletasComponent implements OnInit {
  @ViewChild('op') op!: Popover;
  private comprobanteService = inject(ComprobanteService);
  boletas = this.comprobanteService.boletas;
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
    this.obtenerBoletas();
  }

  obtenerBoletas(): void {
    this.comprobanteService.obtenerBoletasEmitidas(this.currentPage, this.pageSize).subscribe();
  }

  toggle(event: any) {
    this.op.toggle(event);

  }

  selectFormat(item: any, documentId: string, format: string, ruc_tienda: string, serie: string, correlativo: string) {
    this.selectedFormat = item.value;
    if (isPlatformBrowser(this.platformId)) {
      const url = `${this.url_sunat}${documentId}/getPDF/${format}/${ruc_tienda}-03-${serie}-${correlativo}.pdf`;
      window.open(url, '_blank');
    }
    this.op.hide();
  }

  onPageChange(page: number): void {
    this.comprobanteService.obtenerBoletasEmitidas(page, this.pageSize).subscribe();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }
}
