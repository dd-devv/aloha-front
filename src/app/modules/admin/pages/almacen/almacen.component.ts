import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Button } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { Tag } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { ProductService } from '../../../../services/product.service';
import { AlmacenService } from '../../../../services/almacen.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { Movimiento } from '../../../../interfaces';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-almacen',
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
    Dialog,
    ReactiveFormsModule,
    FormsModule,
    PaginatePipe,
    InputIcon,
    IconField,
    CloudinaryImagePipe,
    PaginationComponent,
    Select
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './almacen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlmacenComponent implements OnInit {
  private productService = inject(ProductService);
  private almacenService = inject(AlmacenService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  registroForm: FormGroup;
  isLoading: boolean = false;
  showModal: boolean = false;
  value: string = '';
  selectedProduct: string | undefined;

  currentPage = 1;
  pageSize = 12;

  // Utilizando los signals del servicio directamente
  readonly products = this.productService.products;
  readonly movimientos = this.almacenService.movimientos;
  movimientosFiltrados = signal<Movimiento[]>([]);
  readonly loading = this.productService.loading;
  readonly loadingMov = this.almacenService.loading;

  tiposMov = [
    { name: 'ENTRADA', code: 'ENTRADA' },
    { name: 'SALIDA', code: 'SALIDA' }
  ];

  constructor() {
    this.registroForm = this.fb.group({
      producto: ['', [
        Validators.required
      ]],
      cantidad: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      tipo: [null, [
        Validators.required
      ]]
    });
  }

  ngOnInit(): void {
    // Obtener movimientos y productos
    this.cargarProductos();
    this.cargarMovimientos();
  }

  get totalPages(): number {
    return Math.ceil(this.movimientosFiltrados().length / this.pageSize);
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

  cargarMovimientos(): void {
    this.almacenService.obtenerMovimientos().subscribe({
      next: (res) => {
        this.movimientosFiltrados.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
      }
    });
  }

  cargarProductos(): void {
    const fecha = new Date();
    this.productService.obtenerProductos().subscribe({
      error: (err) => {
        console.error('Error al cargar asistencias:', err);
      }
    });
  }

  buscarMovimiento(): void {
    if (!this.value || this.value.trim() === '') {
      // Si no hay texto de búsqueda, aplicar solo el filtro de categorías
      this.cargarMovimientos();
      return;
    }

    const busqueda = this.value.toLowerCase().trim();
    const movimientosBase = this.movimientos();
    let baseParaBusqueda = movimientosBase;

    // Luego filtramos por término de búsqueda
    const filtrados = baseParaBusqueda.filter(movimiento =>
      movimiento.producto.codigo.toLowerCase().includes(busqueda) ||
      movimiento.producto.nombre.toLowerCase().includes(busqueda)
    );

    this.movimientosFiltrados.set(filtrados);
    this.currentPage = 1; // Reiniciar a la primera página en búsquedas

    // Mostrar mensaje si no hay resultados
    if (filtrados.length === 0 && !this.loading()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda',
        detail: 'No se encontraron movimientos para tu búsqueda'
      });
    }
  }

  onInputChange(): void {
    this.buscarMovimiento();
  }

  showDialog() {
    this.showModal = true;
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      // Registrar un nuevo movimiento
      this.almacenService.registrarMovimiento({
        producto: this.registroForm.value.producto,
        cantidad: this.registroForm.value.cantidad,
        tipo: this.registroForm.value.tipo.code
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

            this.cargarMovimientos();
            this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar movimiento:', err);
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

  eliminarMovimiento(event: Event, id_movimiento: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Eliminarr movimiento?`,
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
        // Eliminar el usuario
        this.almacenService.eliminarMovimiento(id_movimiento)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.movimientosFiltrados = this.almacenService.movimientos;
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
