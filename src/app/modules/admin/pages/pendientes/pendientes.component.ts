import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { VentaService } from '../../../../services/venta.service';
import { TiendaService } from '../../../../services/tienda.service';
import { environment } from '../../../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { TimeAgoPipe } from '../../../../pipes/time-ago.pipe';
import { ToastModule } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { Venta } from '../../../../interfaces';
import { FormsModule } from '@angular/forms';
import { InputGroupAddon, InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { PromocionService } from '../../../../services/promocion.service';
import { NotaVentaService } from '../../../../services/nota-venta.service';

@Component({
  selector: 'app-pendientes',
  imports: [
    FieldsetModule,
    TableModule,
    CurrencyPipe,
    Button,
    TimeAgoPipe,
    ToastModule,
    Dialog,
    FormsModule,
    InputGroupAddon,
    InputGroupAddonModule,
    InputTextModule,
    InputGroup
  ],
  providers: [MessageService],
  templateUrl: './pendientes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PendientesComponent implements OnInit {
  private ventaService = inject(VentaService);
  private tiendaService = inject(TiendaService);
  private promocionService = inject(PromocionService);
  private notaVentaService = inject(NotaVentaService);
  private messageService = inject(MessageService);
  public url_socket = environment.url_socket;
  private platformId = inject(PLATFORM_ID);
  private socket!: Socket;

  tienda = this.tiendaService.tienda;
  ventas = this.ventaService.ventasPendientes;
  loadingVentas = this.ventaService.loading;
  loadingTienda = this.tiendaService.loading;
  mesasOcupadas: number[] = [];

  visible: boolean = false;
  total_venta = 0;
  mesa_venta = 0;
  num_venta = '';
  id_venta = '';
  promo_code = '';
  descontado: boolean = false;
  id_promocion: string | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.socket = io(environment.url_socket, {
        path: '/socket.io/'
      });
      this.socket.on('connect', () => {
      });
    }
  }

  ngOnInit(): void {
    this.obtenerTienda();
    this.obtenerVentas();

    if (isPlatformBrowser(this.platformId)) {
      this.socket.on('venta-creada', () => {
        this.obtenerVentas();
      });
    }
  }


  obtenerTienda() {
    this.tiendaService.obtenerTienda().subscribe({
      error: (err) => {
        console.error('Error al cargar tienda:', err);
      }
    });
  }

  obtenerVentas() {
    this.ventaService.obtenerVentasAdmin().subscribe({
      error: (err) => {
        console.error('Error al cargar ventas:', err);
      }
    });
  }

  getMesasOcupadas(): number[] {
    this.mesasOcupadas = [];
    const ventasPendientes = this.ventas()?.filter(venta => venta.estado === 'pendiente') || [];

    this.mesasOcupadas = [...new Set(ventasPendientes.map(venta => venta.mesa))];

    return this.mesasOcupadas;
  }

  showDialog(venta: Venta) {
    this.total_venta = venta.total;
    this.mesa_venta = venta.mesa;
    this.num_venta = venta.numeroVenta;
    this.id_venta = venta._id;
    this.visible = true;
  }

  obtenerPromocion() {
    this.promocionService.obtenerPromocionCode(this.promo_code, this.total_venta).subscribe({
      next: (res) => {
        if (res.data) {
          this.id_promocion = res.data._id;
          const descuento = res.data.descuento;
          const valorDescuento = (this.total_venta * descuento) / 100;
          this.total_venta = this.total_venta - valorDescuento;
          this.descontado = true;

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Descuento aplicado correctamente',
            life: 3000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Código incorrecto o monto muy bajo',
            life: 3000
          });
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'Error al aplicar descuento',
          life: 3000
        });
      }
    });
  }

  confirmarVenta() {
    this.ventaService.confirmarVenta(this.id_promocion, this.id_venta).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Venta confirmada',
          detail: res.message,
          life: 3000
        });

        // const anchoPapel = 80;

        this.notaVentaService.obtenerPdfNotaVenta(this.num_venta).subscribe({
          next: (pdfBlob) => {

            this.notaVentaService.descargarPdf(pdfBlob, `nota-venta-${this.num_venta}.pdf`);
          },
          error: (err) => {
            console.error('Error al obtener el PDF:', err);
          }
        });

        this.visible = false;
        this.num_venta = '';
        this.id_venta = '';
        this.promo_code = '';
        this.descontado = false;
        this.id_promocion = null;

        //Emitir el socket
        if (isPlatformBrowser(this.platformId)) {
          this.socket.emit('confirmar-venta', { data: true });
        }

      },
      error: (err) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: err.message,
          life: 3000
        });

        this.visible = false;
      }
    });
  }

}
