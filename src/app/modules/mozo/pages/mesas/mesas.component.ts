import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TiendaService } from '../../../../services/tienda.service';
import { VentaService } from '../../../../services/venta.service';
import { PlatosService } from '../../../../services/platos.service';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { Plato, PlatoVentaReq } from '../../../../interfaces';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { DataView } from 'primeng/dataview';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-mesas',
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
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './mesas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MesasComponent implements OnInit {
  private tiendaService = inject(TiendaService);
  private ventaService = inject(VentaService);
  private platosService = inject(PlatosService);
  private messageService = inject(MessageService);

  tienda = this.tiendaService.tienda;
  ventas = this.ventaService.ventasPendientes;
  platos = this.platosService.platos;
  selectedPlatos: Plato[] = [];
  loadingVentas = this.ventaService.loading;
  loadingTienda = this.tiendaService.loading;
  mesasPaint: number[] = [];
  mesaSeleccionada: number = 0;

  visible: boolean = false;
  subtotal: number = 0;

  ngOnInit(): void {
    this.obtenerTienda();
    this.obtenerVentasMozo();
    this.obtenerPlatos();
  }

  showDialog(mesa: number) {
    this.mesaSeleccionada = mesa;
    this.selectedPlatos = [];
    this.subtotal = 0;
    this.visible = true;
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

  guardarVenta() {
    if (this.selectedPlatos.length === 0 || this.mesaSeleccionada === 0) {
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
          this.visible = false;
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
}
