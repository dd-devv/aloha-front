import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { VentaService } from '../../../../services/venta.service';
import { TiendaService } from '../../../../services/tienda.service';
import { environment } from '../../../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { TimeAgoPipe } from '../../../../pipes/time-ago.pipe';
import { ToastModule } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { DataSerieCorrelative, Plato, PlatoVentaReq, Venta } from '../../../../interfaces';
import { FormsModule } from '@angular/forms';
import { InputGroupAddon, InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { PromocionService } from '../../../../services/promocion.service';
import { NotaVentaService } from '../../../../services/nota-venta.service';
import { Select } from 'primeng/select';
import { PlatosService } from '../../../../services/platos.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { DataView } from 'primeng/dataview';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';
import { SelectButton } from 'primeng/selectbutton';
import { DniRucService } from '../../../../services/DniRuc.service';
import { DNIResponse, RUCResponse } from '../../../../interfaces/DniRuc.interfaces';
import { ComprobanteService } from '../../../../services/comprobante.service';
import { NumeroLetrasService } from '../../../../services/numero-letras.service';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-pendientes',
  imports: [
    FieldsetModule,
    TableModule,
    CurrencyPipe,
    Button,
    MultiSelectModule,
    CloudinaryImagePipe,
    DataView,
    CommonModule,
    CurrencyPipe,
    InputGroupAddonModule,
    InputTextModule,
    TimeAgoPipe,
    ToastModule,
    Dialog,
    FormsModule,
    InputGroupAddon,
    InputGroupAddonModule,
    InputTextModule,
    InputGroup,
    Select,
    Message,
    Tooltip,
    SelectButton,
    ToggleSwitch
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
  private platosService = inject(PlatosService);
  public url_socket = environment.url_socket;
  private platformId = inject(PLATFORM_ID);
  private socket!: Socket;

  private dniRucService = inject(DniRucService);
  clienteRuc = this.dniRucService.clienteRUC;
  clienteDni = this.dniRucService.clienteDNI;
  loadingDniRuc = this.dniRucService.loading;
  errorDniRuc = this.dniRucService.error;

  private comprobanteService = inject(ComprobanteService);
  comprobanteSunat = this.comprobanteService.comprobanteSunat;
  comprobanteLocal = this.comprobanteService.comprobanteLocal;
  loadingComprobante = this.comprobanteService.loading;
  errorComprobante = this.comprobanteService.error;
  latestSerieCorrelative = this.comprobanteService.latestSerieCorrelative;

  private _numeroLetrasService = inject(NumeroLetrasService);

  tienda = this.tiendaService.tienda;
  ventas = this.ventaService.ventasPendientes;
  platos = this.platosService.platos;
  selectedPlatos: Plato[] = [];
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

  visible1: boolean = false;
  mesaSeleccionada: number = 0;
  subtotal: number = 0;

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
  facturaOptions: any[] = ['Ticket', 'Boleta', 'Factura'];
  valueFactura: string = 'Ticket';
  valueDoc: string = '';
  tipo_documento: string = '03';

  ventaToEmitComprobante: Venta = {} as Venta;

  public data_facturacion: any = {};
  public data_comprobante: any = {};
  url_sunat = environment.url_doc_sunat;

  downloadTicket = true;
  downloadDetails = true;

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
    this.ventaService.obtenerVentasAdmin().subscribe({
      next: (res) => {
        this.ventas().forEach(venta => {
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

  getMesasOcupadas(): number[] {
    this.mesasOcupadas = [];
    const ventasPendientes = this.ventas()?.filter(venta => venta.estado === 'pendiente') || [];

    this.mesasOcupadas = [...new Set(ventasPendientes.map(venta => venta.mesa))];

    return this.mesasOcupadas;
  }

  showDialog(venta: Venta) {
    this.ventaToEmitComprobante = venta;
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
          this.ventaToEmitComprobante = response.data;
          this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          this.visible1 = false;

          // Configurar variables necesarias para el comprobante
          this.id_venta = response.data._id;
          this.num_venta = response.data.numeroVenta;
          this.total_venta = response.data.total;
          this.mesa_venta = response.data.mesa;

          // Abrir el diálogo de confirmación con los datos de la nueva venta
          this.visible = true;

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

  confirmarVenta() {
    // Validar que tenemos los datos necesarios
    if (!this.id_venta) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha seleccionado una venta válida',
        life: 3000
      });
      return;
    }

    if (!this.selectedMP.code) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar un medio de pago',
        life: 3000
      });
      return;
    }

    this.ventaService.confirmarVenta(this.id_promocion, this.selectedMP.code, this.id_venta).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Venta confirmada',
          detail: res.message,
          life: 3000
        });

        if (this.valueFactura == 'Ticket') {
          if (this.downloadTicket) {
            this.notaVentaService.obtenerPdfNotaVenta(this.num_venta).subscribe({
              next: (pdfBlob) => {
                this.notaVentaService.descargarPdf(pdfBlob, `nota-venta-${this.num_venta}.pdf`);
                // Limpiar formulario después de descargar el PDF
                this.limpiarFormulario();
              },
              error: (err) => {
                console.error('Error al obtener el PDF:', err);
                // Limpiar formulario incluso si hay error
                this.limpiarFormulario();
              }
            });
          } else {
            // Si no se descarga ticket, limpiar inmediatamente
            this.limpiarFormulario();
          }
        } else {
          // Para comprobantes (Boleta/Factura), primero obtener datos del cliente si es necesario
          if (this.valueDoc && this.valueDoc.length >= 8) {
            // Primero obtener los datos del cliente
            this.obtenerCliente();
            // Luego obtener el correlativo y generar el comprobante
            setTimeout(() => {
              this.obtenerUltimoCorrelativo(this.valueFactura);
              setTimeout(() => {
                this.generar_comprobante();
              }, 300);
            }, 300);
          } else {
            // Si no hay documento, obtener correlativo con el tipo seleccionado
            this.obtenerUltimoCorrelativo(this.valueFactura);
            setTimeout(() => {
              this.generar_comprobante();
            }, 500);
          }
        }

        this.obtenerVentas();

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

  limpiarFormularioSinDownloadDetails() {
    this.data_comprobante = {};
    this.selectedPlatos = [];
    this.subtotal = 0;
    this.mesaSeleccionada = 0;
    this.selectedMP = { name: '', code: '' };
    this.tipo_documento = '03';
    this.valueFactura = 'Ticket';
    this.valueDoc = '';
    this.clienteDni.set({} as DNIResponse);
    this.clienteRuc.set({} as RUCResponse);
    // NO resetear downloadDetails aquí

    this.visible = false;
    this.num_venta = '';
    this.id_venta = '';
    this.promo_code = '';
    this.descontado = false;
    this.id_promocion = null;
  }

  limpiarFormulario() {
    this.limpiarFormularioSinDownloadDetails();
    this.downloadDetails = true; // Solo resetear downloadDetails al final
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

  obtenerCliente() {
    if (this.valueDoc.length === 8) {
      // DNI - Solo para boletas
      this.dniRucService.obtenerClienteDNI(this.valueDoc).subscribe({
        next: () => {
          // No llamar obtenerUltimoCorrelativo aquí porque ya se llamó antes
        }
      });
      this.clienteRuc.set({} as RUCResponse);
    } else if (this.valueDoc.length === 11) {
      // RUC - Para boletas y facturas
      this.dniRucService.obtenerClienteRUC(this.valueDoc).subscribe({
        next: () => {
          // No llamar obtenerUltimoCorrelativo aquí porque ya se llamó antes
        }
      });
      this.clienteDni.set({} as DNIResponse);
    }
  }

  transformPlatosVenta(venta: Venta, totalComprobante?: number): any {
    // Si downloadDetails es false, devolver solo un producto genérico "Consumo"
    if (!this.downloadDetails) {
      const total = totalComprobante || this.total_venta || this.subtotal;
      return [{
        codigo: 'CONS',
        descripcion: 'Consumo',
        cantidad: 1,
        precio_unitario: total,
        precio_total: total,
        unidad_medida: 'unidad'
      }];
    }

    // Si downloadDetails es true, mantener el comportamiento original con todos los detalles
    if (venta.platos) {
      return venta.platos.map(plato => ({
        codigo: plato.nombre.substring(0, 6).toUpperCase(),
        descripcion: plato.nombre,
        cantidad: plato.cantidad,
        precio_unitario: plato.precio,
        precio_total: plato.subtotal,
        unidad_medida: 'unidad'
      }));
    } else {
      return this.selectedPlatos.map(plato => ({
        codigo: plato.nombre.substring(0, 6).toUpperCase(),
        descripcion: plato.nombre,
        cantidad: plato.cantidad,
        precio_unitario: plato.precio,
        precio_total: plato.precio * plato.cantidad,
        unidad_medida: 'unidad'
      }));
    }
  }

  obtenerUltimoCorrelativo(tipo_doc: string) {
    const total = this.total_venta || this.subtotal;
    const fecha_actual = new Date();
    const fecha_formateada = fecha_actual.toISOString().split('T')[0];
    const hora_formateada = fecha_actual.toTimeString().split(' ')[0];

    if (tipo_doc === 'Ticket') {
      this.latestSerieCorrelative.set({} as DataSerieCorrelative);
      this.tipo_documento = '03'; // Reset to default
      return;
    }

    // Asignar el tipo de documento ANTES de hacer la consulta
    if (tipo_doc === 'Boleta') {
      this.tipo_documento = '03';
    } else if (tipo_doc === 'Factura') {
      this.tipo_documento = '01';
    }

    this.comprobanteService.obtenerUltimoCorrelativo(this.tipo_documento).subscribe({
      next: (res) => {
        this.data_facturacion = {
          id_venta: this.id_venta || null,
          razon_social_tienda: 'ALOHA RESTOBAR',
          nombre_comercial_tienda: 'ALOHA',
          ruc_tienda: '10712880754',
          direccion_tienda: "Jr. Cusco N° 246, Ayacucho, Peru",
          ciudad_tienda: 'AYACUCHO',

          tipo_documento: this.tipo_documento,
          serie: this.latestSerieCorrelative().ultimo_serie,
          correlativo: this.latestSerieCorrelative().ultimo_correlativo,
          forma_pago: 'Contado',

          nombre_cliente: this.clienteDni().full_name || this.clienteRuc().razon_social || 'CLIENTE VARIOS',
          numero_documento_cliente: this.clienteDni().document_number || this.clienteRuc().numero_documento || '00000000',
          direccion_cliente: this.clienteRuc().direccion || 'SIN DIRECCIÓN',
          fecha_emision: fecha_formateada,
          hora_emision: hora_formateada,
          productos: [], // Se asignará en generar_comprobante

          total: total,
          subtotal: Number((total / 1.18).toFixed(2)),
          igv: Number((total - (total / 1.18)).toFixed(2)),
          monto_letras: this._numeroLetrasService.numeroALetras(total),
          comentarios: ''
        }
      },
      error: (err) => {
        console.error('Error al obtener correlativo:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener el correlativo',
          life: 3000
        });
      }
    });
  }

  generar_comprobante() {
    // Construir productos aquí donde downloadDetails se respeta correctamente
    this.data_facturacion.productos = this.transformPlatosVenta(this.ventaToEmitComprobante, this.data_facturacion.total);

    // Actualizar datos del cliente aquí también por si cambiaron después de obtener el correlativo
    this.data_facturacion.nombre_cliente = this.clienteDni().full_name || this.clienteRuc().razon_social || 'CLIENTE VARIOS';
    this.data_facturacion.numero_documento_cliente = this.clienteDni().document_number || this.clienteRuc().numero_documento || '00000000';
    this.data_facturacion.direccion_cliente = this.clienteRuc().direccion || 'SIN DIRECCIÓN';

    let data_api_sunat = {
      fileName: `10712880754-${this.data_facturacion.tipo_documento}-${this.data_facturacion.serie}-${this.data_facturacion.correlativo}`,
      documentBody: this.data_facturacion
    }

    this.comprobanteService.insertarComprobanteSunat(data_api_sunat).subscribe({
      next: (res) => {
        this.data_facturacion.documentId = res.data.documentId;

        this.comprobanteService.insertarComprobanteLocal(this.data_facturacion).subscribe({
          next: (resp) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Se generó correctamente el comprobante',
              life: 3000
            });

            if (isPlatformBrowser(this.platformId)) {
              const url = `${this.url_sunat}${this.data_facturacion.documentId}/getPDF/80mm/10712880754-${this.data_facturacion.tipo_documento}-${this.data_facturacion.serie}-${this.data_facturacion.correlativo}.pdf`;
              window.open(url, '_blank');
            }
            // Limpiar formulario después de generar el comprobante (ahora con reset de downloadDetails)
            this.limpiarFormulario();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al guardar el comprobante localmente',
              life: 3000
            });
            // Limpiar formulario incluso si hay error (ahora con reset de downloadDetails)
            this.limpiarFormulario();
          }
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'danger',
          summary: 'ERROR',
          detail: err.error?.error?.error?.message || 'Error al generar comprobante en SUNAT',
          life: 3000
        });
        // Limpiar formulario incluso si hay error (ahora con reset de downloadDetails)
        this.limpiarFormulario();
      }
    });
  }
}
