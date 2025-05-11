import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { MessageService } from 'primeng/api';
import { ComandaService } from '../../../../services/comanda.service';
import { DatumComanda } from '../../../../interfaces';
import { environment } from '../../../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-pedidos-barman',
  imports: [
    FormsModule,
    CardModule,
    TableModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    CloudinaryImagePipe
  ],
  providers: [MessageService],
  templateUrl: './pedidos-barman.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PedidosBarmanComponent implements OnInit {
  private comandaService = inject(ComandaService);
  private messageService = inject(MessageService);
  comandasAll = this.comandaService.comandasAll;
  loading = this.comandaService.loading;
  public url_socket = environment.url_socket;
  private platformId = inject(PLATFORM_ID);
  private socket!: Socket;

  comandaCheckedMap: { [id: string]: boolean } = {};

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.socket = io(environment.url_socket, {
        path: '/socket.io/'  // Especifica la misma ruta que en el backend
      });
      this.socket.on('connect', () => {
      });
    }
  }

  ngOnInit() {
    this.obtenerComandas();

    this.socket.on('venta-creada', () => {
      this.obtenerComandas();
    });
  }

  obtenerComandas() {
    this.comandaService.obtenerComandas().subscribe({
      next: (res) => {
        this.inicializarEstadoComandas();
      },
      error: (err) => {
        console.error('Error al cargar comandas:', err);
      }
    });
  }

  inicializarEstadoComandas() {
    const datumComandas: DatumComanda[] | undefined = this.comandasAll();
    if (datumComandas) {
      datumComandas.forEach(datumComanda => {
        datumComanda.comandas.forEach(comanda => {
          this.comandaCheckedMap[comanda._id] = comanda.estado === 'listo';
        });
      });
    }
  }

  marcarComoEntregado(id_comanda: string) {
    this.comandaService.actualizarComanda('listo', id_comanda).subscribe({
      next: (res) => {
        this.obtenerComandas();
        this.messageService.add({ severity: 'success', summary: 'Registrado', detail: res.message, life: 3000 });
      },
      error: (err) => {
        console.error('Error al registrar producto:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
      }
    });
  }
}
