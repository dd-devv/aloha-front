import { CommonModule, isPlatformBrowser, NgClass, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Dialog } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConsumoService } from '../../../../services/consumo.service';
import { finalize, forkJoin } from 'rxjs';
import { UserService } from '../../../../services/user.service';
import { Plato, PlatoVentaReq, User } from '../../../../interfaces';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { DataView } from 'primeng/dataview';
import { PlatosService } from '../../../../services/platos.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-gastos-personal',
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
    Dialog,
    ReactiveFormsModule,
    FormsModule,
    PaginatePipe,
    PaginationComponent,
    Select,
    MultiSelectModule,
    CloudinaryImagePipe,
    DataView,
    NgFor,
    NgClass,
    TableModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './gastos-personal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastosPersonalComponent implements OnInit {
  private consumoService = inject(ConsumoService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private platosService = inject(PlatosService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  registroForm: FormGroup;
  isLoading: boolean = false;
  showModal: boolean = false;
  value: string = '';
  empleadoId: string = '';
  selectedGasto: string | undefined;

  currentPage = 1;
  pageSize = 12;

  // Utilizando los signals del servicio directamente
  readonly gastos = this.consumoService.gastosPersonal;
  readonly consumos = this.consumoService.consumosPersonal;
  readonly usuarios = this.userService.users;
  gastosFiltrados = signal<any[]>([]);
  readonly loading = this.consumoService.loading;

  platos = this.platosService.platos;
  selectedPlatos: Plato[] = [];

  subtotal: number = 0;

  selectedUser: User = {} as User;

  opciones = [
    { name: 'Otros', code: 'Otros' },
    { name: 'Plato', code: 'Plato' }
  ];

  selectedOpc: { name: string; code: string } = {
    name: 'Otros',
    code: 'Otros'
  };

  constructor() {
    this.registroForm = this.fb.group({
      concepto: ['', [
        Validators.required
      ]],
      empleado: ['', [
        Validators.required
      ]],
      monto: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[0-9.]+$')
      ]]
    });
  }

  ngOnInit(): void {
    // Obtener gastos
    this.cargarGastosYConsumos();
    this.cargarUsuarios();
    this.obtenerPlatos();
  }

  get totalPages(): number {
    return Math.ceil(this.gastosFiltrados().length / this.pageSize);
  }

  onPageChange(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }

  getErrorMessage(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      switch (controlName) {
        case 'producto':
          return 'El producto es obligatorio';
        case 'cantidad':
          return 'La cantidad es obligatoria';
        case 'tipo':
          return 'El tipo es obligatorio';
        default:
          return 'Este campo es obligatorio';
      }
    }

    if (errors['pattern']) {
      switch (controlName) {
        case 'cantidad':
          return 'Solo números';
        default:
          return 'Formato inválido';
      }
    }

    return 'Campo inválido';
  }

  isInvalid(controlName: string, form: FormGroup): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  cargarGastosYConsumos(): void {
    forkJoin({
      gastos: this.consumoService.obtenerGastosPersonales(),
      consumos: this.consumoService.obtenerConsumosPersonal()
    }).subscribe({
      next: (res) => {
        // Unificar los arreglos
        const gastosUnificados = [...this.gastos(), ...this.consumos()];

        // Ordenar por createdAt (más reciente primero)
        gastosUnificados.sort((a, b) => {
          const fechaA = new Date(a.createdAt).getTime();
          const fechaB = new Date(b.createdAt).getTime();
          return fechaB - fechaA;
        });

        this.gastosFiltrados.set(gastosUnificados);
      },
      error: (err) => {
        console.error('Error al cargar gastos y consumos:', err);
      }
    });
  }

  cargarUsuarios(): void {
    this.userService.obtenerUsuarios().subscribe();
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

  showDialog() {
    this.showModal = true;
  }

  closeDialog() {
    this.showModal = false;
    this.registroForm.reset();
    this.selectedPlatos = [];
    this.selectedUser = {} as User;
    this.subtotal = 0;
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      // Registrar un nuevo gasto
      this.consumoService.registrarGastoPersonal({
        concepto: this.registroForm.value.concepto,
        monto: this.registroForm.value.monto,
        empleado: this.registroForm.value.empleado
      })
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Cerrar el diálogo y resetear el formulario
              this.showModal = false;
              this.registroForm.reset();
            }

            this.cargarGastosYConsumos();
            this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar gasto:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }

  eliminarGasto(event: Event, id_gasto: string, tipo: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Eliminar gasto?`,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Confirmar',
        severity: 'danger',
        icon: 'pi pi-trash'
      },
      accept: () => {

        if (tipo === 'Plato') {
          // Eliminar el gasto
          this.consumoService.eliminarConsumoPersonal(id_gasto)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
            .subscribe({
              next: (response) => {
                this.cargarGastosYConsumos();
                this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: response.message, life: 3000 });
              },
              error: (err) => {
                console.error('Error al actualizar gasto:', err);
              }
            });
        } else {
          // Eliminar el gasto
          this.consumoService.eliminarGastoPersonal(id_gasto)
            .pipe(
              finalize(() => {
                this.isLoading = false;
              })
            )
            .subscribe({
              next: (response) => {
                this.cargarGastosYConsumos();
                this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: response.message, life: 3000 });
              },
              error: (err) => {
                console.error('Error al actualizar gasto:', err);
              }
            });
        }
      },
      reject: () => {
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
    this.consumoService.registrarConsumoPersonal({
      platos: platosVenta,
      empleadoId: this.selectedUser._id
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarGastosYConsumos();
          this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          this.closeDialog();
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
