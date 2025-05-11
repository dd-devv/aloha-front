// inicio-chef.component.ts
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ComandaService } from '../../../../services/comanda.service';
import { DatumComanda, Comanda } from '../../../../interfaces/comanda.interface'; // Ajusta la ruta según tu estructura
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';

@Component({
  selector: 'app-inicio-chef',
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
  templateUrl: './inicio-chef.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InicioChefComponent implements OnInit {
  private comandaService = inject(ComandaService);
  private messageService = inject(MessageService);
  comandasAll = this.comandaService.comandasAll;
  loading = this.comandaService.loading;

  comandaCheckedMap: { [id: string]: boolean } = {};

  ngOnInit() {
    this.obtenerComandas();
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
