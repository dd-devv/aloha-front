import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GastoService } from '../../../../services/gasto.service';
import { Gasto } from '../../../../interfaces';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-gastos',
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
    InputIcon,
    IconField,
    PaginationComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './gastos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastosComponent implements OnInit {
  private gastoService = inject(GastoService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  registroForm: FormGroup;
  isLoading: boolean = false;
  showModal: boolean = false;
  value: string = '';
  selectedGasto: string | undefined;

  currentPage = 1;
  pageSize = 12;

  // Utilizando los signals del servicio directamente
  readonly gastos = this.gastoService.gastos;
  gastosFiltrados = signal<Gasto[]>([]);
  readonly loading = this.gastoService.loading;

  constructor() {
    this.registroForm = this.fb.group({
      concepto: ['', [
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
    this.cargarGastos();
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

  cargarGastos(): void {
    this.gastoService.obtenerGastos().subscribe({
      next: (res) => {
        this.gastosFiltrados.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar gastos:', err);
      }
    });
  }

  buscarGasto(): void {
    if (!this.value || this.value.trim() === '') {
      // Si no hay texto de búsqueda, aplicar solo el filtro de categorías
      this.cargarGastos();
      return;
    }

    const busqueda = this.value.toLowerCase().trim();
    const gastosBase = this.gastos();
    let baseParaBusqueda = gastosBase;

    // Luego filtramos por término de búsqueda
    const filtrados = baseParaBusqueda.filter(gasto =>
      gasto.concepto.toLowerCase().includes(busqueda)
    );

    this.gastosFiltrados.set(filtrados);
    this.currentPage = 1; // Reiniciar a la primera página en búsquedas

    // Mostrar mensaje si no hay resultados
    if (filtrados.length === 0 && !this.loading()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda',
        detail: 'No se encontraron gastos para tu búsqueda'
      });
    }
  }

  onInputChange(): void {
    this.buscarGasto();
  }

  showDialog() {
    this.showModal = true;
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      // Registrar un nuevo gasto
      this.gastoService.registrarGasto({
        concepto: this.registroForm.value.concepto,
        monto: this.registroForm.value.monto
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

            this.cargarGastos();
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

  eliminarGasto(event: Event, id_gasto: string) {
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
        // Eliminar el gasto
        this.gastoService.eliminargasto(id_gasto)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.gastosFiltrados = this.gastoService.gastos;
              this.messageService.add({ severity: 'success', summary: 'Confirmado', detail: response.message, life: 3000 });
            },
            error: (err) => {
              console.error('Error al actualizar gasto:', err);
              // Aquí puedes manejar el error, por ejemplo mostrando un mensaje al gasto
            }
          });
      },
      reject: () => {
      }
    });
  }
}
