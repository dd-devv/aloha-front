import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { VentaService } from '../../../../services/venta.service';
import { TiendaService } from '../../../../services/tienda.service';
import { environment } from '../../../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser, NgClass, NgFor } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { Plato, PlatoVentaReq, Venta } from '../../../../interfaces';
import { FormsModule } from '@angular/forms';
import { InputGroupAddon, InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { PromocionService } from '../../../../services/promocion.service';
import { NotaVentaService } from '../../../../services/nota-venta.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { DataView } from 'primeng/dataview';
import { Message } from 'primeng/message';
import { PlatosService } from '../../../../services/platos.service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-pendientes',
  imports: [
    FieldsetModule,
    TableModule,
    CurrencyPipe,
    Button,
    ToastModule,
    Dialog,
    FormsModule,
    InputGroupAddon,
    InputGroupAddonModule,
    InputTextModule,
    InputGroup,
    DatePipe,
    PaginationComponent,
    PaginatePipe,
    InputIcon,
    IconField,
    Select,
    MultiSelectModule,
    CloudinaryImagePipe,
    DataView,
    Message,
    NgFor,
    NgClass,
    Tooltip
  ],
  providers: [MessageService],
  templateUrl: './ventas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private tiendaService = inject(TiendaService);
  private promocionService = inject(PromocionService);
  private notaVentaService = inject(NotaVentaService);
  private messageService = inject(MessageService);
  private platosService = inject(PlatosService);
  public url_socket = environment.url_socket;
  private platformId = inject(PLATFORM_ID);
  private socket!: Socket;

  tienda = this.tiendaService.tienda;
  ventas = this.ventaService.ventas;
  ventasFiltradas = signal<Venta[]>([]);
  loadingVentas = this.ventaService.loading;
  loadingTienda = this.tiendaService.loading;
  mesasOcupadas: number[] = [];
  platos = this.platosService.platos;
  selectedPlatos: Plato[] = [];
  visible1: boolean = false;
  mesaSeleccionada: number = 0;
  subtotal: number = 0;

  value: string = '';
  //Para paginacion
  currentPage = 1;
  pageSize = 9;

  visible: boolean = false;
  total_venta = 0;
  mesa_venta = 0;
  num_venta = '';
  id_venta = '';
  promo_code = '';
  descontado: boolean = false;
  id_promocion: string | null = null;

  medios_pago = [
    { name: 'Yape', code: 'Yape' },
    { name: 'Plin', code: 'Plin' },
    { name: 'Efectivo', code: 'Efectivo' },
    { name: 'Transferencia', code: 'Transferencia' }
  ];

  selectedMP: { name: string; code: string } = {
    name: '',
    code: ''
  };

  estadosVentas = signal<{ [key: string]: boolean }>({});

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
    this.obtenerPlatos();

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
    this.ventaService.obtenerVentas().subscribe({
      next: (res) => {
        this.ventasFiltradas = this.ventaService.ventas;
        this.ventasFiltradas().forEach(venta => {
          this.cargarEstadoComandas(venta._id);
        });
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
      }
    });
  }

  cargarEstadoComandas(id_venta: string): void {
    this.ventaService.obtenerEstadoComandas(id_venta).subscribe({
      next: (res) => {
        // Actualizar la señal con el nuevo estado
        this.estadosVentas.update(estados => ({
          ...estados,
          [id_venta]: res.data.data
        }));
      },
      error: (err) => {
        console.error('Error al obtener estado de comandas:', err);
        // En caso de error, marcar como false
        this.estadosVentas.update(estados => ({
          ...estados,
          [id_venta]: false
        }));
      }
    });
  }

  // Método para obtener el estado (usa la señal)
  obtenerEstadoComandas(id_venta: string): boolean {
    return this.estadosVentas()[id_venta] || false;
  }

  getMesasOcupadas(): number[] {
    this.mesasOcupadas = [];
    const ventasPendientes = this.ventas()?.filter(venta => venta.estado === 'pendiente') || [];

    this.mesasOcupadas = [...new Set(ventasPendientes.map(venta => venta.mesa))];

    return this.mesasOcupadas;
  }

  showDialogVenta() {
    this.visible1 = true;
  }

  obtenerPlatos() {
    this.platosService.obtenerPlatos().subscribe({
      error: (err) => {
        console.error('Error al cargar platos:', err);
      }
    });
  }

  onPlatoSelect(event: any) {
    this.selectedPlatos.forEach(plato => {
      plato.cantidad = plato.cantidad || 1;
    });

    this.calcularSubtotal();
  }

  incrementarCantidad(plato: Plato) {
    plato.cantidad += 1;
    this.calcularSubtotal();
  }

  decrementarCantidad(plato: Plato) {
    if (plato.cantidad > 1) {
      plato.cantidad -= 1;
      this.calcularSubtotal();
    }
  }

  calcularSubtotal() {
    this.subtotal = this.selectedPlatos.reduce((total, plato) => {
      return total + (plato.precio * plato.cantidad);
    }, 0);
  }

  actualizarCantidad(plato: Plato, event: any) {
    const valor = parseInt(event.target.value);
    if (!isNaN(valor) && valor > 0) {
      plato.cantidad = valor;
    } else {
      plato.cantidad = 1;
    }
    this.calcularSubtotal();
  }

  showDialog(venta: Venta) {
    this.total_venta = venta.total;
    this.mesa_venta = venta.mesa;
    this.num_venta = venta.numeroVenta;
    this.id_venta = venta._id;
    this.visible = true;
  }

  get totalPages(): number {
    return Math.ceil(this.ventasFiltradas().length / this.pageSize);
  }

  onPageChange(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }

  buscarVenta(): void {
    if (!this.value || this.value.trim() === '') {
      // Si no hay texto de búsqueda, aplicar solo el filtro de categorías
      this.obtenerVentas();
      return;
    }

    const busqueda = this.value.toLowerCase().trim();
    const ventasBase = this.ventas();
    let baseParaBusqueda = ventasBase;
    console.log(ventasBase);


    // Luego filtramos por término de búsqueda
    const filtrados = baseParaBusqueda.filter(venta =>
      venta.numeroVenta.toLowerCase().includes(busqueda)
    );

    this.ventasFiltradas.set(filtrados);
    this.currentPage = 1; // Reiniciar a la primera página en búsquedas

    // Mostrar mensaje si no hay resultados
    if (filtrados.length < 1) {
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda',
        detail: 'No se encontraron ventas para tu búsqueda'
      });
    }
  }

  onInputChange(): void {
    this.buscarVenta();
  }

  guardarVenta() {
    if (this.selectedPlatos.length === 0) {
      return;
    }

    // Preparar el formato de platos para la API
    const platosVenta: PlatoVentaReq[] = this.selectedPlatos.map(plato => {
      return {
        plato: plato._id,
        cantidad: plato.cantidad,
      };
    });

    // Enviar la solicitud al servicio
    this.ventaService.registrarVenta({
      platos: platosVenta,
      mesa: this.mesaSeleccionada
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          this.visible1 = false;

          this.id_venta = response.data._id;
          this.num_venta = response.data.numeroVenta;

          this.confirmarVenta();

          //Emitir el socket
          if (isPlatformBrowser(this.platformId)) {
            this.socket.emit('crear-venta', { data: true });
          }

        } else {
          console.error('Error al registrar venta:', response.message);
        }
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        this.messageService.add({ severity: 'danger', summary: 'Error', detail: err.message, life: 3000 });
      }
    });
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
    this.ventaService.confirmarVenta(this.id_promocion, this.selectedMP.code, this.id_venta).subscribe({
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

  dscargarPdfNotaVenta(codigo: string) {
    this.notaVentaService.obtenerPdfNotaVenta(codigo).subscribe({
      next: (pdfBlob) => {
        this.notaVentaService.descargarPdf(pdfBlob, `Venta-${codigo}.pdf`);
      },
      error: (err) => {
        console.error('Error al obtener el PDF:', err);
      }
    });
  }

  descargarPdfVenta(id_venta: string, numero_venta: string) {
    this.ventaService.obtenerPdfVenta(id_venta).subscribe({
      next: (pdfBlob) => {
        this.ventaService.descargarPdf(pdfBlob, `Venta-${numero_venta}.pdf`);
      },
      error: (err) => {
        console.error('Error al obtener el PDF:', err);
      }
    });
  }
}
