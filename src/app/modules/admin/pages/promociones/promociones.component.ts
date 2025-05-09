import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Dialog } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { DatePicker } from 'primeng/datepicker';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PromocionService } from '../../../../services/promocion.service';
import { Promocion } from '../../../../interfaces';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-promociones',
  imports: [
    CommonModule,
    FieldsetModule,
    Button,
    PanelModule,
    Tag,
    Dialog,
    InputText,
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    DatePipe,
    ConfirmPopupModule,
    ToastModule,
    AvatarModule,
    BadgeModule,
    PaginationComponent,
    PaginatePipe,
    InputIcon,
    IconField,
    DatePicker,
    CurrencyPipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './promociones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PromocionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private promocionService = inject(PromocionService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);

  visible: boolean = false;
  visibleUpdate: boolean = false;
  registroForm: FormGroup;
  updateForm: FormGroup;
  isLoading = false;
  id_promocion_update = '';
  imageUrls: string[] = [];

  // Utilizando los signals del servicio directamente
  readonly promociones = this.promocionService.promociones;
  promocionesFiltrados = signal<Promocion[]>([]);
  readonly loading = this.promocionService.loading;
  readonly error = this.promocionService.error;

  value: string = '';

  //Para paginacion
  currentPage = 1;
  pageSize = 12;

  tiposPromocion = [
    { name: 'porcentaje', code: 'porcentaje' },
    { name: 'monto', code: 'monto' }
  ];

  constructor() {
    this.registroForm = this.fb.group({
      codigo: ['', [
        Validators.required
      ]],
      descuento: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      montoMinimo: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      fechaInicio: ['', [
        Validators.required
      ]],
      fechaFin: ['', [
        Validators.required
      ]]
    });

    this.updateForm = this.fb.group({
      codigo: ['', [
        Validators.required
      ]],
      descuento: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      montoMinimo: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      fechaInicio: ['', [
        Validators.required
      ]],
      fechaFin: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit(): void {
    // Obtener los platos al inicializar el componente
    this.cargarPromociones();
  }

  get totalPages(): number {
    return Math.ceil(this.promocionesFiltrados().length / this.pageSize);
  }

  onPageChange(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }

  cargarPromociones(): void {
    this.promocionService.obtenerPromociones().subscribe({
      // No necesitamos hacer nada aquí porque el servicio ya actualiza el signal
      next: (res) => {
        this.promocionesFiltrados.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar promociones:', err);
      }
    });
  }

  buscarPromocion(): void {
    if (!this.value || this.value.trim() === '') {
      // Si no hay texto de búsqueda, aplicar solo el filtro de categorías
      this.cargarPromociones();
      return;
    }

    const busqueda = this.value.toLowerCase().trim();
    const promocionesBase = this.promociones();
    let baseParaBusqueda = promocionesBase;

    // Luego filtramos por término de búsqueda
    const filtrados = baseParaBusqueda.filter(promocion =>
      promocion.codigo.toLowerCase().includes(busqueda)
    );

    this.promocionesFiltrados.set(filtrados);
    this.currentPage = 1; // Reiniciar a la primera página en búsquedas

    // Mostrar mensaje si no hay resultados
    if (filtrados.length === 0 && !this.loading()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Búsqueda',
        detail: 'No se encontraron promociones para tu búsqueda'
      });
    }
  }

  onInputChange(): void {
    this.buscarPromocion();
  }

  showDialog() {
    this.visible = true;
  }

  showDialogUpdate(promocion: Promocion) {
    this.updateForm.patchValue({
      codigo: promocion.codigo,
      descuento: promocion.descuento,
      montoMinimo: promocion.montoMinimo,
      fechaInicio: new Date(promocion.fechaInicio),
      fechaFin: new Date(promocion.fechaFin)
    });

    this.id_promocion_update = promocion._id;

    this.visibleUpdate = true;
  }

  getErrorMessage(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      switch (controlName) {
        case 'nombre':
          return 'El nombre es obligatorio';
        case 'unidades':
          return 'Las unidades son obligatorias';
        case 'precioUnitario':
          return 'El precio unitario es obligatorio';
        case 'codigo':
          return 'El código es obligatorio';
        default:
          return 'Este campo es obligatorio';
      }
    }

    if (errors['pattern']) {
      switch (controlName) {
        case 'nombre':
          return 'Solo se permiten letras';
        case 'unidades':
          return 'Solo letras';
        case 'precioUnitario':
          return 'Solo números';
        case 'codigo':
          return 'Solo letras y números';
        default:
          return 'Formato inválido';
      }
    }

    if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  isInvalid(controlName: string, form: FormGroup): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      // Registrar una nueva promoción
      this.promocionService.registrarPromocion({
        codigo: this.registroForm.value.codigo,
        descuento: this.registroForm.value.descuento,
        montoMinimo: this.registroForm.value.montoMinimo,
        fechaInicio: this.registroForm.value.fechaInicio,
        fechaFin: this.registroForm.value.fechaFin
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
              this.visible = false;
              this.registroForm.reset();
            }

            this.promocionesFiltrados.update(promocion => [...promocion, response.data]);
            this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar promocion:', err);
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

  async onUpdateSubmit(): Promise<void> {
    if (this.updateForm.valid) {
      this.isLoading = true;

      try {
        // Actualizar la promocion
        this.promocionService.actualizarPromocion({
          codigo: this.updateForm.value.codigo,
          descuento: this.updateForm.value.descuento,
          montoMinimo: this.updateForm.value.montoMinimo,
          fechaInicio: this.updateForm.value.fechaInicio,
          fechaFin: this.updateForm.value.fechaFin
        }, this.id_promocion_update)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.visibleUpdate = false;
                this.updateForm.reset();
              }

              this.promocionesFiltrados.set(this.promocionService.promociones());
              this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: response.message, life: 3000 });
            },
            error: (err) => {
              console.error('Error al actualizar promoción:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
            }
          });
      } catch (error) {
        this.isLoading = false;
        console.error('Error al subir imágenes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un error al subir las imágenes',
          life: 3000
        });
      }
    } else {
      Object.keys(this.updateForm.controls).forEach(key => {
        this.updateForm.get(key)?.markAsTouched();
      });
    }
  }

  confirmDelete(event: Event, promocion_name: string, id_promocion: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Eliminar ${promocion_name}?`,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
        icon: 'pi pi-trash'
      },
      accept: () => {
        // eliminar la promoción
        this.promocionService.eliminarPromocion(id_promocion)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: response.message, life: 3000 });
              this.promocionesFiltrados = this.promocionService.promociones;
            },
            error: (err) => {
              console.error('Error al eliminar promoción:', err);
              // Aquí puedes manejar el error, por ejemplo mostrando un mensaje al usuario
            }
          });
      },
      reject: () => {
      }
    });
  }

  getPromoVigente(id_promocion: string): boolean {
    const promos = this.promociones();
    const promocion = promos.find(p => p._id === id_promocion);
    if (promocion) {
      const now = new Date();

      // Convertir fechaFin a objeto Date si es un string
      let fechaFin = promocion.fechaFin;
      if (typeof fechaFin === 'string') {
        fechaFin = new Date(fechaFin);
      }

      let fechaInicio = promocion.fechaInicio;
      if (typeof fechaInicio === 'string') {
        fechaInicio = new Date(fechaInicio);
      }

      return (fechaInicio < now) && (now < fechaFin);
    }

    return false;
  }
}
