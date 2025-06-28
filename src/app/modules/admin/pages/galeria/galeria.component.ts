import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { finalize } from 'rxjs';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import { TiendaService } from '../../../../services/tienda.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface FileWithUrl {
  file?: File;
  url: string;
  name: string;
  size?: number;
  isNew?: boolean;
}

@Component({
  selector: 'app-galeria',
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
    FileUploadModule,
    AvatarModule,
    BadgeModule,
    OverlayBadgeModule,
    ProgressSpinnerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './galeria.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaleriaComponent implements OnInit {
  @ViewChild('fileUploaderUpdate') fileUploaderUpdate!: FileUpload;
  private tiendaService = inject(TiendaService);
  private messageService = inject(MessageService);
  private cloudinaryService = inject(CloudinaryService);
  private cdr = inject(ChangeDetectorRef);

  tienda = this.tiendaService.tienda;
  readonly loading = this.tiendaService.loading;

  // Señales para manejo reactivo del estado
  uploadedFiles = signal<FileWithUrl[]>([]);
  uploadedFilesUpdate = signal<FileWithUrl[]>([]);
  isUploading = signal<boolean>(false);
  pendingUploads = signal<number>(0);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.tiendaService.obtenerTienda().subscribe({
      next: (res) => {
        this.tienda.set(res.data);

        // Cargar las imágenes existentes en la galería de actualización
        if (res.data?.galeria) {
          let existingImages: FileWithUrl[] = [];

          // Verificar si galeria es un array de strings (URLs)
          if (Array.isArray(res.data.galeria)) {
            existingImages = res.data.galeria
              .filter((item: any) => typeof item === 'string' && item.trim() !== '') // Filtrar URLs válidas
              .map((url: string, index: number) => ({
                url: url.trim(),
                name: `imagen-${index + 1}`,
                isNew: false
              }));
          }

          this.uploadedFilesUpdate.set(existingImages);
        } else {
          this.uploadedFilesUpdate.set([]);
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos de la tienda',
          life: 3000
        });
      }
    });
  }

  // Método para añadir nuevas imágenes
  onSelect(event: any): void {

    // Verificar diferentes estructuras posibles del evento
    let files: File[] = [];
    if (event.files && Array.isArray(event.files)) {
      files = event.files;
    } else if (event.currentFiles && Array.isArray(event.currentFiles)) {
      files = event.currentFiles;
    } else if (Array.isArray(event)) {
      files = event;
    }

    if (files.length === 0) {
      return;
    }

    this.isUploading.set(true);
    this.pendingUploads.set(files.length);

    files.forEach((file: File) => {
      this.uploadToCloudinary(file, 'new');
    });
  }

  // Método para modificar imágenes existentes
  onSelectUpdate(event: any): void {

    // Verificar diferentes estructuras posibles del evento
    let files: File[] = [];
    if (event.files && Array.isArray(event.files)) {
      files = event.files;
    } else if (event.currentFiles && Array.isArray(event.currentFiles)) {
      files = event.currentFiles;
    } else if (Array.isArray(event)) {
      files = event;
    }

    if (files.length === 0) {
      return;
    }

    this.isUploading.set(true);
    this.pendingUploads.set(files.length);

    files.forEach((file: File) => {
      this.uploadToCloudinary(file, 'update');
    });
  }

  uploadToCloudinary(file: File, type: 'new' | 'update'): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Subiendo imagen',
      detail: `Procesando ${file.name}...`
    });

    this.cloudinaryService.uploadImage(file).pipe(
      finalize(() => {
        const pending = this.pendingUploads() - 1;
        this.pendingUploads.set(pending);

        if (pending === 0) {
          this.isUploading.set(false);
        }

        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        const imageUrl = response.secure_url;

        const fileWithUrl: FileWithUrl = {
          file: file,
          url: imageUrl,
          name: file.name,
          size: file.size,
          isNew: true
        };

        if (type === 'new') {
          this.uploadedFiles.update(files => [...files, fileWithUrl]);
        } else {
          this.uploadedFilesUpdate.update(files => [...files, fileWithUrl]);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Imagen subida',
          detail: `${file.name} se subió correctamente`
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al subir imagen',
          detail: `No se pudo subir ${file.name}. Inténtelo de nuevo.`
        });
      }
    });
  }

  // Remover imagen de la galería nueva
  removeImage(index: number): void {
    this.uploadedFiles.update(files => files.filter((_, i) => i !== index));

    this.messageService.add({
      severity: 'info',
      summary: 'Imagen eliminada',
      detail: 'La imagen ha sido removida de la lista'
    });
  }

  // Remover imagen de la galería de actualización
  removeImageUpdate(index: number): void {
    this.uploadedFilesUpdate.update(files => files.filter((_, i) => i !== index));

    this.messageService.add({
      severity: 'info',
      summary: 'Imagen eliminada',
      detail: 'La imagen ha sido removida de la galería'
    });
  }

  // Limpiar todas las imágenes nuevas
  clearNewImages(): void {
    this.uploadedFiles.set([]);
    this.messageService.add({
      severity: 'info',
      summary: 'Imágenes limpiadas',
      detail: 'Se han removido todas las imágenes nuevas'
    });
  }

  // Añadir imágenes nuevas a la galería existente
  addNewImagesToGallery(): void {
    const newImages = this.uploadedFiles();
    if (newImages.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin imágenes',
        detail: 'No hay imágenes nuevas para añadir'
      });
      return;
    }

    const newUrls = newImages.map(img => img.url);
    const currentGallery = this.tienda()?.galeria || [];
    const updatedGallery = [...currentGallery, ...newUrls];

    this.actualizarGaleria(updatedGallery);
  }

  // Actualizar toda la galería
  updateGallery(): void {
    const updateImages = this.uploadedFilesUpdate();
    const updatedGallery = updateImages.map(img => img.url);

    this.actualizarGaleria(updatedGallery);
  }

  // Método común para actualizar galería
  private actualizarGaleria(galeria: string[]): void {
    if (!this.tienda()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontraron datos de la tienda'
      });
      return;
    }

    this.tiendaService.actualizarGaleriaTienda(galeria)
      .subscribe({
        next: (response) => {
          this.tienda.set(response.data);

          // Limpiar imágenes nuevas después de añadirlas
          this.uploadedFiles.set([]);

          // Actualizar la vista de modificación con la nueva galería
          if (response.data?.galeria) {
            const updatedImages: FileWithUrl[] = response.data.galeria.map((url: string, index: number) => ({
              url: url,
              name: `imagen-${index + 1}`,
              isNew: false
            }));
            this.uploadedFilesUpdate.set(updatedImages);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Galería actualizada',
            detail: response.message || 'La galería se ha actualizado correctamente',
            life: 3000
          });

          this.cdr.markForCheck();
          this.fileUploaderUpdate.clear();
          this.fileUploaderUpdate.files = [];
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al actualizar',
            detail: err.message || 'No se pudo actualizar la galería',
            life: 3000
          });
        }
      });
  }

  // Obtener el número total de imágenes
  getTotalImages(): number {
    return this.uploadedFilesUpdate().length;
  }

  // Verificar si hay cambios pendientes
  hasPendingChanges(): boolean {
    return this.uploadedFiles().length > 0;
  }

  // Métodos para debug de imágenes
  onImageError(event: any, file: FileWithUrl): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Error de imagen',
      detail: `No se pudo cargar la imagen: ${file.name}`,
      life: 3000
    });
  }
}
