import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin, tap } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../../../interfaces';
import { CommonModule } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Button } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { DataView } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { ConsumoService } from '../../../../services/consumo.service';

@Component({
  selector: 'app-detalles-sueldo',
  imports: [
    CommonModule,
    FieldsetModule,
    Button,
    PanelModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    ConfirmPopupModule,
    ToastModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    RouterLink
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalles-sueldo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DetallesSueldoComponent implements OnInit {
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private consumoService = inject(ConsumoService);

  readonly gastos = this.consumoService.gastosPersonalUser;
  readonly consumos = this.consumoService.consumosPersonalUser;
  readonly users = this.userService.users;
  readonly loading = this.consumoService.loading;
  user: User = {} as User;
  gastosUnidos = signal<any[]>([]);

  idUsuario = signal<string | null>(null);
  totalGastos = 0;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(params => {
        const id = params.get('id_usuario');
        this.idUsuario.set(id);
      })).subscribe();

    this.cargarUsuarios();
    this.cargarGastosYConsumos();
  }

  cargarUsuarios(): void {
    this.userService.obtenerUsuarios().subscribe({
      // No necesitamos hacer nada aquí porque el servicio ya actualiza el signal
      next: () => {
        this.user = this.users().find(user => user._id === this.idUsuario()) as User;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  cargarGastosYConsumos(): void {
    forkJoin({
      gastos: this.consumoService.obtenerGastosPersonalesUser(this.idUsuario()!),
      consumos: this.consumoService.obtenerConsumosPersonalUser(this.idUsuario()!)
    }).subscribe({
      next: (res) => {
        // Unificar los arreglos

        const gastoSum = this.gastos().reduce((sum, gasto) => sum + gasto.monto, 0);
        const consumoSum = this.consumos().reduce((sum, consumo) => sum + consumo.subtotal, 0);

        this.totalGastos = gastoSum + consumoSum;

        const gastosUnificados = [...this.gastos(), ...this.consumos()];

        // Ordenar por createdAt (más reciente primero)
        gastosUnificados.sort((a, b) => {
          const fechaA = new Date(a.createdAt).getTime();
          const fechaB = new Date(b.createdAt).getTime();
          return fechaB - fechaA;
        });

        this.gastosUnidos.set(gastosUnificados);
      },
      error: (err) => {
        console.error('Error al cargar gastos y consumos:', err);
      }
    });
  }

  confirmarPago() {
    this.consumoService.actualizarGastosPersonales(this.idUsuario()!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gastos actualizados correctamente' });
        this.cargarGastosYConsumos();
      },
      error: (err) => {
        console.error('Error al actualizar gastos:', err);
      }
    });

    this.consumoService.actualizarConsumosPersonal(this.idUsuario()!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Gastos actualizados correctamente' });
        this.cargarGastosYConsumos();
      },
      error: (err) => {
        console.error('Error al actualizar gastos:', err);
      }
    });
  }

}
