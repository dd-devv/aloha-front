import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
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

@Component({
  selector: 'app-users',
  imports: [
    TableModule,
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
    DatePipe
  ],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  visible: boolean = false;
  registroForm: FormGroup;
  isLoading = false;

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

  // Método para determinar la severidad del tag según el rol
  getRoleSeverity(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'MOZO':
        return 'info';
      case 'CHEF':
        return 'warning';
      case 'BARMAN':
        return 'success';
      default:
        return 'info';
    }
  }

  // Métodos adicionales para las acciones de la tabla
  editarUsuario(user: User): void {
    // Implementar lógica para editar usuario
    console.log('Editar usuario:', user);
    // Aquí podrías cargar los datos en el formulario y abrir el diálogo
  }

  confirmarEliminacion(user: User): void {
    // Implementar lógica para confirmar eliminación
    console.log('Confirmar eliminación de usuario:', user);
    // Aquí podrías mostrar un diálogo de confirmación
  }

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

  getErrorMessage(controlName: string): string {
    const control = this.registroForm.get(controlName);

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

  isInvalid(controlName: string): boolean {
    const control = this.registroForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.isLoading = true;

      // Registrar el nuevo usuario
      this.userService.registrarUsuario({
        nombres: this.registroForm.value.nombres,
        apellidos: this.registroForm.value.apellidos,
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
          },
          error: (err) => {
            console.error('Error al registrar usuario:', err);
            // Aquí puedes manejar el error, por ejemplo mostrando un mensaje al usuario
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }
}
