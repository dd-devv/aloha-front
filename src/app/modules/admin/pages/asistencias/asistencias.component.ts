import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Button } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../../../services/user.service';
import { finalize } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { AsistenciaService } from '../../../../services/asistencia.service';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';


@Component({
  selector: 'app-asistencias',
  imports: [
    CommonModule,
    FieldsetModule,
    Button,
    PanelModule,
    Tag,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    TitleCasePipe,
    ConfirmPopupModule,
    ToastModule,
    Tooltip,
    Dialog
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './asistencias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AsistenciasComponent {
  private userService = inject(UserService);
  private asistenciaService = inject(AsistenciaService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  isLoading: boolean = false;
  showModal: boolean = false;
  name_user: string = '';

  // Utilizando los signals del servicio directamente
  readonly users = this.userService.users;
  readonly asistencias = this.asistenciaService.asistencias;
  readonly asistenciasTrabajador = this.asistenciaService.asistenciasTrabajador;
  readonly loading = this.asistenciaService.loading;
  readonly loadingTrabajador = this.asistenciaService.loadingTrabajador;
  readonly error = this.asistenciaService.error;

  constructor() {

  }

  ngOnInit(): void {
    // Obtener asistencias
    this.cargarAsistencias();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.userService.obtenerUsuarios().subscribe({
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  cargarAsistencias(): void {
    const fecha = new Date();
    this.asistenciaService.obtenerAsistencias(fecha).subscribe({
      error: (err) => {
        console.error('Error al cargar asistencias:', err);
      }
    });
  }

  showDialogAsist(id_trabajador: string, nombre: string) {
    this.cargarAsistenciasTrabajador(id_trabajador);
    this.showModal = true;
    this.name_user = nombre;
  }

  cargarAsistenciasTrabajador(id_trabajador: string): void {
    this.asistenciaService.obtenerAsistenciasTrabajador(id_trabajador).subscribe({
      error: (err) => {
        console.error('Error al cargar asistencias:', err);
      }
    });
  }

  isAsistenciaRegistrada(id_usuario: string): boolean {
    const asists = this.asistencias();
    return asists.find(as => as.trabajador._id === id_usuario) !== undefined;
  }

  confirmAsist(event: Event, id_user: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Confirmar asistencia?`,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Confirmar',
        severity: 'success',
        icon: 'pi pi-check'
      },
      accept: () => {
        // Eliminar el usuario
        this.asistenciaService.registrarAsistencia({
          trabajador: id_user,
          fechaEntrada: new Date()
        })
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.cargarAsistencias();
              this.cargarUsuarios();
              this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: response.message, life: 3000 });
            },
            error: (err) => {
              console.error('Error al actualizar usuario:', err);
              // Aquí puedes manejar el error, por ejemplo mostrando un mensaje al usuario
            }
          });
      },
      reject: () => {
      }
    });
  }
}
