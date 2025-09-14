import { CommonModule } from '@angular/common';
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
import { ToastModule } from 'primeng/toast';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { finalize } from 'rxjs';
import { CloudinaryService } from '../../../../services/cloudinary.service';
import { TiendaService } from '../../../../services/tienda.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-datos-tienda',
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
    ConfirmPopupModule,
    ToastModule,
    FileUploadModule,
    AvatarModule,
    BadgeModule,
    AvatarModule,
    OverlayBadgeModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './datos-tienda.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatosTiendaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tiendaService = inject(TiendaService);
  private messageService = inject(MessageService);
  private cloudinaryService = inject(CloudinaryService);

  @ViewChild('fileUpload') fileUpload!: FileUpload;

  registroForm: FormGroup;
  isLoading = false;
  imageUrl: string = '';
  isUploading = signal(false);

  // Utilizando los signals del servicio directamente
  tienda = this.tiendaService.tienda;
  readonly loading = this.tiendaService.loading;
  visible = false;

  uploadedFiles: any[] = [];

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required
      ]],
      direccion: ['', [
        Validators.required
      ]],
      telefono: ['', [
        Validators.required,
        Validators.maxLength(9)
      ]],
      whatsapp: ['', [
        Validators.required,
        Validators.maxLength(9)
      ]],
      horaEntrada: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(23),
        Validators.pattern('^[0-9]+$')
      ]],
      tolerancia: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(59),
        Validators.pattern('^[0-9]+$')
      ]],
      numeroMesas: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern('^[0-9]+$')
      ]]
    });
  }

  ngOnInit(): void {
    // Obtener los datos al inicializar el componente
    this.cargarDatos();
  }

  showDialog() {
    this.visible = true;
  }

  cargarDatos(): void {
    this.tiendaService.obtenerTienda().subscribe({
      // No necesitamos hacer nada aquí porque el servicio ya actualiza el signal
      next: (res) => {
        this.tienda.set(res.data);
        this.registroForm.patchValue({
          nombre: res.data.nombre,
          direccion: res.data.direccion,
          telefono: res.data.telefono,
          whatsapp: res.data.whatsapp,
          horaEntrada: res.data.horaEntrada,
          tolerancia: res.data.tolerancia,
          numeroMesas: res.data.numeroMesas

        });

        this.imageUrl = this.tienda()!.logo;
      },
      error: (err) => {
        console.error('Error al cargar tienda:', err);
      }
    });
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
        case 'direccion':
          return 'La dirección es obligatoria';
        case 'telefono':
          return 'Teléfono obligatorio';
        case 'whatsapp':
          return 'Whatsapp obligatorio';
        case 'horaEntrada':
          return 'La hora de entrada es obligatoria';
        case 'tolerancia':
          return 'La tolerancia es obligatoria';
        case 'numeroMesas':
          return 'Número de mesas obligatorio';
        default:
          return 'Este campo es obligatorio';
      }
    }

    if (errors['pattern']) {
      switch (controlName) {
        case 'horaEntrada':
          return 'Solo números de 00 a 23';
        case 'tolerancia':
          return 'Solo números de 00 a 59';
        case 'numeroMesas':
          return 'Solo números mayores a 0';
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

  onSelect(event: any) {

    if (this.fileUpload && this.fileUpload.files && this.fileUpload.files.length > 0) {
      // Tomar el primer archivo seleccionado
      const file = this.fileUpload.files[0];
      this.uploadToCloudinary(file);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ningún archivo seleccionado',
        detail: 'Por favor seleccione una imagen para subir.'
      });
    }
  }

  choose(event: any, callback: any) {
    // Ejecutar el callback para abrir el diálogo de selección de archivos
    callback();
  }

  onRemoveTemplatingFile(event: any, removeFileCallback: any, index: number) {
    // Ejecutar el callback para eliminar el archivo
    removeFileCallback(event, index);
  }

  uploadToCloudinary(file: File) {
    // Activar el estado de carga
    this.isUploading.set(true);

    // Mostrar un mensaje de carga
    this.messageService.add({
      severity: 'info',
      summary: 'Subiendo imagen',
      detail: 'Espere un momento...'
    });

    this.cloudinaryService.uploadImage(file).subscribe({
      next: (response) => {
        // Guardar la URL de la imagen
        this.imageUrl = response.secure_url;

        // Añadir el archivo a los archivos subidos
        this.uploadedFiles = [file];

        // Actualizar la tienda con la nueva imagen
        this.onUpdateSubmit();

        this.imageUrl = '';
        this.uploadedFiles = [];
        this.fileUpload.clear();

        // Cerrar el diálogo si está abierto
        this.visible = false;

        // Desactivar el estado de carga
        this.isUploading.set(false);
      },
      error: (error) => {
        console.error('Error al subir la imagen:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al subir la imagen',
          detail: 'Ocurrió un error al subir la imagen a Cloudinary.'
        });

        // Desactivar el estado de carga en caso de error
        this.isUploading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      // Registrar una tienda
      this.tiendaService.registrarTienda({
        nombre: this.registroForm.value.nombre,
        direccion: this.registroForm.value.direccion,
        telefono: this.registroForm.value.telefono,
        whatsapp: this.registroForm.value.whatsapp,
        horaEntrada: this.registroForm.value.horaEntrada,
        tolerancia: this.registroForm.value.tolerancia,
        numeroMesas: this.registroForm.value.numeroMesas,
        logo: this.imageUrl
      })
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            this.tienda.update(() => response.data);
            this.messageService.add({
              severity: 'success',
              summary: 'Registrado',
              detail: response.message,
              life: 3000
            });
          },
          error: (err) => {
            console.error('Error al registrar tienda:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message,
              life: 3000
            });
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }

  onUpdateSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      console.log(this.imageUrl);

      this.tiendaService.actualizarTienda({
        nombre: this.registroForm.value.nombre,
        direccion: this.registroForm.value.direccion,
        telefono: this.registroForm.value.telefono,
        whatsapp: this.registroForm.value.whatsapp,
        horaEntrada: this.registroForm.value.horaEntrada,
        tolerancia: this.registroForm.value.tolerancia,
        numeroMesas: this.registroForm.value.numeroMesas,
        logo: this.imageUrl
      })
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            this.tienda.set(response.data);
            this.messageService.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: response.message,
              life: 3000
            });
          },
          error: (err) => {
            console.error('Error al actualizar tienda:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message,
              life: 3000
            });
          }
        });
    } else {
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }
}
