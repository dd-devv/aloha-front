import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FieldsetModule } from 'primeng/fieldset';
import { Button } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { Select } from 'primeng/select';
import { User } from '../../../../interfaces';
import { UserService } from '../../../../services/user.service';
import { finalize } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    FieldsetModule,
    Button,
    PanelModule,
    Tag,
    Dialog,
    InputText,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    Select,
    TitleCasePipe,
    DatePipe,
    ConfirmPopupModule,
    ToastModule,
    RouterLink
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  visible: boolean = false;
  visibleUpdate: boolean = false;
  visibleUpdatePass: boolean = false;
  registroForm: FormGroup;
  updateForm: FormGroup;
  passForm: FormGroup;
  isLoading = false;
  id_user_update = '';

  // Utilizando los signals del servicio directamente
  readonly users = this.userService.users;
  readonly loading = this.userService.loading;
  readonly error = this.userService.error;

  roles = [
    { name: 'ADMIN', code: 'ADMIN' },
    { name: 'MOZO', code: 'MOZO' },
    { name: 'CHEF', code: 'CHEF' },
    { name: 'BARMAN', code: 'BARMAN' }
  ]

  constructor() {
    this.registroForm = this.fb.group({
      nombres: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      sueldo: [0, [
        Validators.required,
        Validators.min(0)
      ]],
      username: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      role: [null, Validators.required]
    });

    this.updateForm = this.fb.group({
      nombres: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')
      ]],
      sueldo: [0, [
        Validators.required,
        Validators.min(0)
      ]],
      role: ['', Validators.required]
    });

    this.passForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      userId: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit(): void {
    // Obtener los usuarios al inicializar el componente
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.userService.obtenerUsuarios().subscribe({
      // No necesitamos hacer nada aquí porque el servicio ya actualiza el signal
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  showDialog() {
    this.visible = true;
  }

  showDialogUpdate(user: User) {
    this.updateForm.patchValue({
      nombres: user.nombres,
      apellidos: user.apellidos,
      sueldo: user.sueldo,
      role: { name: user.role, code: user.role }
    });

    this.id_user_update = user._id;

    this.visibleUpdate = true;
  }


  showDialogUpdatePass(user: User) {
    this.passForm.patchValue({
      newPassword: '',
      userId: user._id,
    });

    this.visibleUpdatePass = true;
  }

  getErrorMessage(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      switch (controlName) {
        case 'nombres':
          return 'Los nombres son obligatorios';
        case 'apellidos':
          return 'Los apellidos son obligatorios';
        case 'username':
          return 'El nombre de usuario es obligatorio';
        case 'password':
          return 'La contraseña es obligatoria';
        case 'role':
          return 'El rol es obligatorio';
        default:
          return 'Este campo es obligatorio';
      }
    }

    if (errors['pattern']) {
      switch (controlName) {
        case 'nombres':
        case 'apellidos':
          return 'Solo se permiten letras';
        case 'username':
          return 'Solo letras, números y guiones bajos';
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

      // Registrar el nuevo usuario
      this.userService.registrarUsuario({
        nombres: this.registroForm.value.nombres,
        apellidos: this.registroForm.value.apellidos,
        sueldo: this.registroForm.value.sueldo,
        username: this.registroForm.value.username,
        password: this.registroForm.value.password,
        role: this.registroForm.value.role.code
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
            this.messageService.add({ severity: 'success', summary: 'Registrado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al registrar usuario:', err);
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

  onUpdateSubmit(): void {
    if (this.updateForm.valid) {
      this.isLoading = true;

      // Actualizar el usuario
      this.userService.actualizarUsuario({
        nombres: this.updateForm.value.nombres,
        apellidos: this.updateForm.value.apellidos,
        sueldo: this.updateForm.value.sueldo,
        role: this.updateForm.value.role.code
      }, this.id_user_update)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Cerrar el diálogo y resetear el formulario
              this.visibleUpdate = false;
              this.updateForm.reset();
            }

            this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al actualizar usuario:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.updateForm.controls).forEach(key => {
        this.updateForm.get(key)?.markAsTouched();
      });
    }
  }


  onUpdatePassSubmit(): void {
    if (this.passForm.valid) {
      this.isLoading = true;

      // Actualizar el usuario
      this.userService.actualizarPassword({
        newPassword: this.passForm.value.newPassword,
        userId: this.passForm.value.userId
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
              this.visibleUpdatePass = false;
              this.passForm.reset();
            }

            this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: response.message, life: 3000 });
          },
          error: (err) => {
            console.error('Error al actualizar contraseña:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.passForm.controls).forEach(key => {
        this.passForm.get(key)?.markAsTouched();
      });
    }
  }

  confirmDelete(event: Event, username: string, id_user: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Eliminar ${username}?`,
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
        // Eliminar el usuario
        this.userService.eliminarUsuario(id_user)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (response) => {
              this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: response.message, life: 3000 });
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
