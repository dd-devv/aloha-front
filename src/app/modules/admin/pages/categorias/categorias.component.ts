import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Dialog } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { finalize } from 'rxjs';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { CategoriaService } from '../../../../services/categoria.service';
import { Categoria } from '../../../../interfaces/categoria.interfaces';

@Component({
  selector: 'app-categorias',
  imports: [
    CommonModule,
    FieldsetModule,
    Button,
    PanelModule,
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
    PaginatePipe
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './categorias.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CategoriasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);

  visible: boolean = false;
  visibleUpdate: boolean = false;
  visibleUpdatePass: boolean = false;
  registroForm: FormGroup;
  updateForm: FormGroup;
  isLoading = false;
  id_categoria = '';
  imageUrls: string[] = [];

  // Utilizando los signals del servicio directamente
  readonly categorias = this.categoriaService.categorias;
  categoriasFiltrados = signal<Categoria[]>([]);
  readonly loading = this.categoriaService.loading;
  readonly error = this.categoriaService.error;

  value: string = '';

  uploadedFiles: any[] = [];
  uploadedFilesUpdate: any[] = [];
  newImagesToUpload: File[] = [];

  //Para paginacion
  currentPage = 1;
  pageSize = 12;

  constructor() {
    this.registroForm = this.fb.group({
      descripcion: ['', [
        Validators.required
      ]]
    });

    this.updateForm = this.fb.group({
      descripcion: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit(): void {
    // Obtener los productos al inicializar el componente
    this.cargarCategorias();
  }

  get totalPages(): number {
    return Math.ceil(this.categoriasFiltrados().length / this.pageSize);
  }

  onPageChange(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe({
      // No necesitamos hacer nada aquí porque el servicio ya actualiza el signal
      next: (res) => {
        this.categoriasFiltrados.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  showDialog() {
    this.visible = true;
  }

  showDialogUpdate(categoria: Categoria) {
    this.updateForm.patchValue({
      descripcion: categoria.descripcion
    });

    this.id_categoria = categoria._id;
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
        case 'descripcion':
          return 'La descripcion es obligatoria';
        default:
          return 'Este campo es obligatorio';
      }
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

      // Registrar nueva categoría
      this.categoriaService.registrarCategoria({
        descripcion: this.registroForm.value.descripcion
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

            this.categoriasFiltrados.update(categoria => [...categoria, response.data]);
            this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar categoría:', err);
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

      this.categoriaService.actualizarCategoria({
        descripcion: this.updateForm.value.descripcion
      }, this.id_categoria)
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

            this.categoriasFiltrados.set(this.categoriaService.categorias());
            this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al actualizar categoría:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
          }
        });
    } else {
      Object.keys(this.updateForm.controls).forEach(key => {
        this.updateForm.get(key)?.markAsTouched();
      });
    }
  }

  confirmDelete(event: Event, product_name: string, id_product: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Eliminar ${product_name}?`,
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
        // eliminar categoria
        this.categoriaService.eliminarCategoria(id_product)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: response.message, life: 3000 });
              this.categoriasFiltrados = this.categoriaService.categorias;
            },
            error: (err) => {
              console.error('Error al eliminar producto:', err);
              // Aquí puedes manejar el error, por ejemplo mostrando un mensaje al usuario
            }
          });
      },
      reject: () => {
      }
    });
  }
}
