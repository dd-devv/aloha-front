import { CommonModule, DatePipe, isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
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
import { Tag } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FileUpload } from 'primeng/fileupload';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { Plato } from '../../../../interfaces';
import { finalize } from 'rxjs';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { PlatosService } from '../../../../services/platos.service';
import { Select } from 'primeng/select';
import { CategoriaService } from '../../../../services/categoria.service';

@Component({
  selector: 'app-platos',
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
    TitleCasePipe,
    DatePipe,
    ConfirmPopupModule,
    ToastModule,
    FileUpload,
    AvatarModule,
    CloudinaryImagePipe,
    BadgeModule,
    PaginationComponent,
    PaginatePipe,
    InputIcon,
    IconField,
    Select
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './platos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlatosComponent implements OnInit {
  @ViewChild('fileUploader') fileUploader!: FileUpload;
  @ViewChild('fileUploaderUpdate') fileUploaderUpdate!: FileUpload;
  private fb = inject(FormBuilder);
  private platoService = inject(PlatosService);
  private categoriaService = inject(CategoriaService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private cloudinaryService = inject(CloudinaryService);
  private platformId = inject(PLATFORM_ID);

  visible: boolean = false;
  visibleUpdate: boolean = false;
  registroForm: FormGroup;
  updateForm: FormGroup;
  isLoading = false;
  id_plato_update = '';
  imageUrls: string[] = [];

  // Utilizando los signals del servicio directamente
  readonly platos = this.platoService.platos;
  readonly categorias = this.categoriaService.categorias;
  platosFiltrados = signal<Plato[]>([]);
  readonly loading = this.platoService.loading;
  readonly error = this.platoService.error;

  value: string = '';

  uploadedFiles: any[] = [];
  uploadedFilesUpdate: any[] = [];
  newImagesToUpload: File[] = [];

  //Para paginacion
  currentPage = 1;
  pageSize = 12;

  tiposPlato = [
    { name: 'comida', code: 'comida' },
    { name: 'bebida', code: 'bebida' }
  ];

  estadosPlato = [
    { name: 'disponible', code: 'disponible' },
    { name: 'agotado', code: 'agotado' }
  ]

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required
      ]],
      categoria: [null, Validators.required],
      precio: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      codigo: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      tipo: [null, Validators.required]
    });

    this.updateForm = this.fb.group({
      nombre: ['', [
        Validators.required
      ]],
      categoria: [null, Validators.required],
      precio: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      codigo: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      tipo: [null, Validators.required],
      estado: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtener los platos al inicializar el componente
    this.cargarPlatos();
    this.cargarCategorias();
  }

  get totalPages(): number {
    return Math.ceil(this.platosFiltrados().length / this.pageSize);
  }

  onPageChange(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }

  cargarPlatos(): void {
    this.platoService.obtenerPlatos().subscribe({
      // No necesitamos hacer nada aquí porque el servicio ya actualiza el signal
      next: (res) => {
        this.platosFiltrados.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar platos:', err);
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe({
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  getCategoryName(id_categoria: string): string {
    const categoria = this.categorias().find(c => c._id === id_categoria);
    return categoria ? categoria.descripcion : '';
  }

  buscarPlato(): void {
    if (!this.value || this.value.trim() === '') {
      // Si no hay texto de búsqueda, aplicar solo el filtro de categorías
      this.cargarPlatos();
      return;
    }

    const busqueda = this.value.toLowerCase().trim();
    const platosBase = this.platos();
    let baseParaBusqueda = platosBase;

    // Luego filtramos por término de búsqueda
    const filtrados = baseParaBusqueda.filter(plato =>
      plato.codigo.toLowerCase().includes(busqueda) ||
      plato.nombre.toLowerCase().includes(busqueda)
    );

    this.platosFiltrados.set(filtrados);
    this.currentPage = 1; // Reiniciar a la primera página en búsquedas

    // Mostrar mensaje si no hay resultados
    if (filtrados.length === 0 && !this.loading()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Búsqueda',
        detail: 'No se encontraron platos para tu búsqueda'
      });
    }
  }

  onInputChange(): void {
    this.buscarPlato();
  }

  resetUploader() {
    this.uploadedFiles = [];
    this.imageUrls = [];
    if (this.fileUploader) {
      this.fileUploader.clear();
      this.fileUploader.files = [];
    }
  }

  resetUpdateUploader() {
    this.newImagesToUpload = [];
    this.imageUrls = [];
    if (this.fileUploaderUpdate) {
      this.fileUploaderUpdate.clear();
      this.fileUploaderUpdate.files = [];
    }
  }

  showDialog() {
    this.visible = true;
    this.resetUploader();
  }

  showDialogUpdate(plato: Plato) {
    const categoriaCompleta = this.categorias().find(c => c._id === plato.categoria);
    this.updateForm.patchValue({
      nombre: plato.nombre,
      categoria: categoriaCompleta || null,
      precio: plato.precio,
      codigo: plato.codigo,
      tipo: { name: plato.tipo, code: plato.tipo },
      estado: { name: plato.estado, code: plato.estado }
    });

    this.uploadedFilesUpdate = [...plato.galeria];
    this.id_plato_update = plato._id;
    this.newImagesToUpload = [];
    this.visibleUpdate = true;
    this.resetUpdateUploader();
  }

  onSelectUpdate(event: any) {
    // Agregamos los nuevos archivos a la lista para subir
    this.newImagesToUpload.push(...event.files);

    // Mostramos una vista previa de los archivos
    for (let file of event.files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedFilesUpdate.push({
          file: file,
          url: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImageUpdate(index: number) {
    const item = this.uploadedFilesUpdate[index];

    // Si es una nueva imagen (aún no subida), la quitamos de la lista
    if (item.file) {
      this.newImagesToUpload = this.newImagesToUpload.filter(f => f !== item.file);
    }

    this.uploadedFilesUpdate.splice(index, 1);
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

  onSelect(event: any) {
    for (let file of event.files) {
      this.uploadToCloudinary(file);
    }
  }

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  uploadToCloudinary(file: File) {
    // Mostrar un mensaje de carga
    this.messageService.add({ severity: 'info', summary: 'Subiendo imagen', detail: 'Espere un momento...' });

    this.cloudinaryService.uploadImage(file).subscribe({
      next: (response) => {
        // Guardar la URL de la imagen
        const imageUrl = response.secure_url;

        this.imageUrls.push(imageUrl);

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Imagen subida'
        });
      },
      error: (error) => {
        console.error('Error al subir la imagen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al subir la imagen',
          detail: 'Ocurrió un error al subir la imagen a Cloudinary.'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      // Registrar un nuevo plato
      this.platoService.registrarPlato({
        nombre: this.registroForm.value.nombre,
        categoria: this.registroForm.value.categoria._id,
        precio: this.registroForm.value.precio,
        codigo: this.registroForm.value.codigo,
        tipo: this.registroForm.value.tipo.code,
        galeria: this.imageUrls
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
              this.resetUploader();
            }

            this.platosFiltrados.update(plato => [...plato, response.data]);
            this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar plato:', err);
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
        // 1. Subir las nuevas imágenes primero
        const newImageUrls = await this.uploadNewImages();

        // 2. Filtrar las URLs existentes (que no son objetos file)
        const existingImages = this.uploadedFilesUpdate
          .filter(item => typeof item === 'string')
          .map(url => url);

        // 3. Combinar las URLs existentes con las nuevas
        const allImages = [...existingImages, ...newImageUrls];

        // 4. Actualizar el plato
        this.platoService.actualizarPlato({
          nombre: this.updateForm.value.nombre,
          categoria: this.updateForm.value.categoria._id,
          precio: this.updateForm.value.precio,
          codigo: this.updateForm.value.codigo,
          tipo: this.updateForm.value.tipo.code,
          estado: this.updateForm.value.estado.code,
          galeria: allImages
        }, this.id_plato_update)
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
                this.resetUpdateUploader();
              }

              this.platosFiltrados.set(this.platoService.platos());
              this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: response.message, life: 3000 });
            },
            error: (err) => {
              console.error('Error al actualizar plato:', err);
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

  private async uploadNewImages(): Promise<string[]> {
    const uploadPromises = this.newImagesToUpload.map(file =>
      this.cloudinaryService.uploadImage(file).toPromise()
    );

    const results = await Promise.all(uploadPromises);
    return results.map(r => r.secure_url);
  }

  confirmDelete(event: Event, plato_name: string, id_plato: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Eliminar ${plato_name}?`,
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
        // eliminar el plato
        this.platoService.eliminarPlato(id_plato)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: response.message, life: 3000 });
              this.platosFiltrados = this.platoService.platos;
            },
            error: (err) => {
              console.error('Error al eliminar plato:', err);
              // Aquí puedes manejar el error, por ejemplo mostrando un mensaje al usuario
            }
          });
      },
      reject: () => {
      }
    });
  }
}
