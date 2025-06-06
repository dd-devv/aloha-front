import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TiendaService } from '../../../../services/tienda.service';
import { VentaService } from '../../../../services/venta.service';
import { PlatosService } from '../../../../services/platos.service';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { Plato, PlatoVenta, PlatoVentaReq, Venta } from '../../../../interfaces';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { DataView } from 'primeng/dataview';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';

// Interface para las opciones del select de mesas
interface MesaOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-modificar-pedidos',
  imports: [
    Dialog,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    CloudinaryImagePipe,
    DataView,
    CommonModule,
    CurrencyPipe,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    Select
  ],
  providers: [MessageService],
  templateUrl: './edit-pedido.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditPedidoComponent implements OnInit {
  private tiendaService = inject(TiendaService);
  private ventaService = inject(VentaService);
  private platosService = inject(PlatosService);
  private messageService = inject(MessageService);
  public url_socket = environment.url_socket;
  private platformId = inject(PLATFORM_ID);
  private socket!: Socket;

  tienda = this.tiendaService.tienda;
  ventas = this.ventaService.ventasPendientes;
  platos = this.platosService.platos;

  selectedPlatos: PlatoVenta[] = [];
  platosDisponibles: Plato[] = [];

  loadingVentas = this.ventaService.loading;
  loadingTienda = this.tiendaService.loading;
  mesasOcupadas: number[] = [];
  mesasPaint: number[] = [];
  mesaLibreSeleccionada: number = 0;
  mesaSeleccionada: number = 0;
  ventaActual: Venta | null = null;

  // Nuevas propiedades para el select de mesas
  mesasDisponibles: MesaOption[] = [];
  mesaSeleccionadaParaCambio: number = 0;

  visible: boolean = false;
  subtotal: number = 0;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.socket = io(environment.url_socket, {
        path: '/socket.io/'  // Especifica la misma ruta que en el backend
      });
      this.socket.on('connect', () => {
      });
    }
  }

  ngOnInit(): void {
    this.obtenerTienda();
    this.obtenerVentasMozo();
    this.obtenerPlatos();
  }

  showDialog(mesa: number) {
    this.mesaSeleccionada = mesa;
    this.mesaSeleccionadaParaCambio = mesa; // Inicializar con la mesa actual
    this.ventaActual = this.ventas()?.find(v => v.mesa === mesa && v.estado === 'pendiente') || null;

    // Cargar los platos ya pedidos (vienen como PlatoVenta)
    if (this.ventaActual) {
      this.selectedPlatos = [...this.ventaActual.platos];
    } else {
      this.selectedPlatos = [];
    }

    // Cargar platos disponibles (convertir Plato a formato compatible con el select)
    this.platosDisponibles = [...(this.platos() || [])];

    // Generar opciones de mesas disponibles
    this.generarMesasDisponibles();

    this.calcularSubtotal();
    this.visible = true;
  }

  // Nuevo método para generar las opciones de mesas disponibles
  generarMesasDisponibles() {
    const mesasLibres = this.getMesasLibres();
    const mesaActual = this.mesaSeleccionada;

    this.mesasDisponibles = [];

    // Agregar la mesa actual (siempre disponible para mantener)
    this.mesasDisponibles.push({
      label: `Mesa ${mesaActual} (Actual)`,
      value: mesaActual
    });

    // Agregar las mesas libres
    mesasLibres.forEach(mesa => {
      if (mesa !== mesaActual) { // Evitar duplicar la mesa actual
        this.mesasDisponibles.push({
          label: `Mesa ${mesa}`,
          value: mesa
        });
      }
    });

    // Ordenar por número de mesa
    this.mesasDisponibles.sort((a, b) => a.value - b.value);
  }

  // Convertir PlatoVenta a formato compatible con el select (para mostrar en el multiselect)
  platoVentaToPlato(platoVenta: PlatoVenta): Plato {
    return {
      _id: platoVenta.plato,
      nombre: platoVenta.nombre,
      categoria: platoVenta.categoria,
      precio: platoVenta.precio,
      galeria: [platoVenta.imagen],
      cantidad: platoVenta.cantidad,
      tipo: '',
      codigo: '',
      estado: '',
      deleted: false,
      createdAt: new Date()
    };
  }

  // Convertir Plato a PlatoVenta (para guardar)
  platoToPlatoVenta(plato: Plato): PlatoVenta {
    return {
      plato: plato._id,
      nombre: plato.nombre,
      categoria: plato.categoria,
      precio: plato.precio,
      imagen: plato.galeria[0],
      cantidad: plato.cantidad || 1,
      subtotal: (plato.precio || 0) * (plato.cantidad || 1),
      _id: '' // Este se genera en el backend
    };
  }

  obtenerTienda() {
    this.tiendaService.obtenerTienda().subscribe({
      error: (err) => {
        console.error('Error al cargar tienda:', err);
      }
    });
  }

  obtenerVentasMozo() {
    this.ventaService.obtenerVentasMozo().subscribe({
      error: (err) => {
        console.error('Error al cargar ventas:', err);
      }
    });
  }

  obtenerPlatos() {
    this.platosService.obtenerPlatos().subscribe({
      error: (err) => {
        console.error('Error al cargar platos:', err);
      }
    });
  }

  getMesasOcupadas(): number[] {
    this.mesasOcupadas = [];
    const ventasPendientes = this.ventas()?.filter(venta => venta.estado === 'pendiente') || [];

    this.mesasOcupadas = [...new Set(ventasPendientes.map(venta => venta.mesa))];

    return this.mesasOcupadas;
  }

  getMesasLibres(): number[] {
    this.mesasPaint = [];
    const ventasPendientes = this.ventas()?.filter(venta => venta.estado === 'pendiente') || [];

    // Extraer los números de mesa ocupados
    const mesasOcupadas = ventasPendientes.map(venta => venta.mesa);

    for (let i = 1; i <= (this.tienda()?.numeroMesas || 0); i++) {
      if (!mesasOcupadas.includes(i)) {
        this.mesasPaint.push(i);
      }
    }

    return this.mesasPaint;
  }

  onPlatoSelect(event: any) {
    this.selectedPlatos.forEach(plato => {
      plato.cantidad = plato.cantidad || 1;
      plato.plato = plato.plato || plato._id
    });

    this.calcularSubtotal();
  }

  // Método para manejar el cambio de mesa
  onMesaChange(event: any) {
    this.mesaSeleccionadaParaCambio = event.value;
  }

  incrementarCantidad(plato: PlatoVenta) {
    plato.cantidad += 1;
    plato.subtotal = plato.precio * plato.cantidad;
    this.calcularSubtotal();
  }

  decrementarCantidad(plato: PlatoVenta) {
    if (plato.cantidad > 1) {
      plato.cantidad -= 1;
      plato.subtotal = plato.precio * plato.cantidad;
      this.calcularSubtotal();
    }
  }

  eliminarPlato(indice: number) {
    this.selectedPlatos.splice(indice, 1);
    this.calcularSubtotal();
  }

  calcularSubtotal() {
    this.subtotal = this.selectedPlatos.reduce((total, plato) => {
      return total + (plato.precio * plato.cantidad);
    }, 0);
  }

  actualizarCantidad(plato: PlatoVenta, event: any) {
    const valor = parseInt(event.target.value);
    if (!isNaN(valor)) {
      plato.cantidad = valor > 0 ? valor : 1;
      plato.subtotal = plato.precio * plato.cantidad;
    } else {
      plato.cantidad = 1;
      plato.subtotal = plato.precio;
    }
    this.calcularSubtotal();
  }

  guardarCambios() {
    if (this.selectedPlatos.length === 0 || this.mesaSeleccionadaParaCambio === 0 || !this.ventaActual) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un plato y una mesa válida',
        life: 3000
      });
      return;
    }

    // Preparar el formato de platos para la API (PlatoVentaReq)
    const platosVenta: PlatoVentaReq[] = this.selectedPlatos.map(platoVenta => {
      return {
        plato: platoVenta.plato,
        cantidad: platoVenta.cantidad
      };
    });

    // Datos a enviar al backend
    const datosActualizacion = {
      platos: platosVenta,
      mesa: this.mesaSeleccionadaParaCambio // Mesa seleccionada en el select
    };

    // Enviar la solicitud al servicio para actualizar
    this.ventaService.actualizarVenta(datosActualizacion, this.ventaActual._id).subscribe({
      next: (response) => {
        if (response.success) {
          // Mensaje de éxito diferente si se cambió de mesa
          const mensaje = this.mesaSeleccionadaParaCambio !== this.mesaSeleccionada
            ? `Pedido movido a Mesa ${this.mesaSeleccionadaParaCambio} correctamente`
            : 'Pedido modificado correctamente';

          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: mensaje,
            life: 3000
          });

          this.visible = false;

          // Actualizar datos locales si es necesario
          this.obtenerVentasMozo();

          //Emitir el socket
          if (isPlatformBrowser(this.platformId)) {
            this.socket.emit('actualizar-venta', response.data);
          }

        } else {
          console.error('Error al actualizar venta:', response.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Error al actualizar el pedido',
            life: 3000
          });
        }
      },
      error: (err) => {
        console.error('Error al actualizar venta:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || err.message || 'Error al actualizar el pedido',
          life: 3000
        });
      }
    });
  }
}
