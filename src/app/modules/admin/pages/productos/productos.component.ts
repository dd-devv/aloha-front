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
import { Product } from '../../../../interfaces';
import { ProductService } from '../../../../services/product.service';
import { finalize } from 'rxjs';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import { CloudinaryImagePipe } from '../../../../pipes/cloudinary-image.pipe';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PaginatePipe } from '../../../../pipes/paginate.pipe';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-productos',
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
    IconField
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './productos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProductosComponent implements OnInit {
  @ViewChild('fileUploader') fileUploader!: FileUpload;
  @ViewChild('fileUploaderUpdate') fileUploaderUpdate!: FileUpload;
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private cloudinaryService = inject(CloudinaryService);
  private platformId = inject(PLATFORM_ID);

  visible: boolean = false;
  visibleUpdate: boolean = false;
  visibleUpdatePass: boolean = false;
  registroForm: FormGroup;
  updateForm: FormGroup;
  isLoading = false;
  id_product_update = '';
  imageUrls: string[] = [];

  // Utilizando los signals del servicio directamente
  readonly products = this.productService.products;
  productsFiltrados = signal<Product[]>([]);
  readonly loading = this.productService.loading;
  readonly error = this.productService.error;

  value: string = '';

  uploadedFiles: any[] = [];
  uploadedFilesUpdate: any[] = [];
  newImagesToUpload: File[] = [];

  //Para paginacion
  currentPage = 1;
  pageSize = 12;

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required
      ]],
      unidades: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      precioUnitario: ['', [
        Validators.required,
        Validators.pattern('^[0-9.]+$')
      ]],
      codigo: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]]
    });

    this.updateForm = this.fb.group({
      nombre: ['', [
        Validators.required
      ]],
      unidades: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      precioUnitario: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]],
      codigo: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]]
    });
  }

  ngOnInit(): void {
    // Obtener los productos al inicializar el componente
    this.cargarProductos();
  }

  get totalPages(): number {
    return Math.ceil(this.productsFiltrados().length / this.pageSize);
  }

  onPageChange(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 10, behavior: 'smooth' });
    }
    this.currentPage = page;
  }

  cargarProductos(): void {
    this.productService.obtenerProductos().subscribe({
      // No necesitamos hacer nada aquí porque el servicio ya actualiza el signal
      next: (res) => {
        this.productsFiltrados.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  buscarProducto(): void {
    if (!this.value || this.value.trim() === '') {
      // Si no hay texto de búsqueda, aplicar solo el filtro de categorías
      this.cargarProductos();
      return;
    }

    const busqueda = this.value.toLowerCase().trim();
    const productosBase = this.products();
    let baseParaBusqueda = productosBase;

    // Luego filtramos por término de búsqueda
    const filtrados = baseParaBusqueda.filter(producto =>
      producto.codigo.toLowerCase().includes(busqueda) ||
      producto.nombre.toLowerCase().includes(busqueda)
    );

    this.productsFiltrados.set(filtrados);
    this.currentPage = 1; // Reiniciar a la primera página en búsquedas

    // Mostrar mensaje si no hay resultados
    if (filtrados.length === 0 && !this.loading()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Búsqueda',
        detail: 'No se encontraron productos para tu búsqueda'
      });
    }
  }

  onInputChange(): void {
    this.buscarProducto();
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

  showDialogUpdate(product: Product) {
    this.updateForm.patchValue({
      nombre: product.nombre,
      unidades: product.unidades,
      precioUnitario: product.precioUnitario,
      codigo: product.codigo
    });

    this.uploadedFilesUpdate = [...product.galeria];
    this.id_product_update = product._id;
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
    console.log('Se debe subir');

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

      // Registrar un nuevo producto
      this.productService.registrarProducto({
        nombre: this.registroForm.value.nombre,
        unidades: this.registroForm.value.unidades,
        precioUnitario: this.registroForm.value.precioUnitario,
        codigo: this.registroForm.value.codigo,
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

            this.productsFiltrados.update(producto => [...producto, response.data]);
            this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar producto:', err);
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

        // 4. Actualizar el producto
        this.productService.actualizarProducto({
          nombre: this.updateForm.value.nombre,
          unidades: this.updateForm.value.unidades,
          precioUnitario: this.updateForm.value.precioUnitario,
          codigo: this.updateForm.value.codigo,
          galeria: allImages
        }, this.id_product_update)
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

              this.productsFiltrados.set(this.productService.products());
              this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: response.message, life: 3000 });
            },
            error: (err) => {
              console.error('Error al actualizar producto:', err);
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
        // eliminar el producto
        this.productService.eliminarProducto(id_product)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: response.message, life: 3000 });
              this.productsFiltrados = this.productService.products;
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
