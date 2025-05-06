import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import AuthService from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    Button,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  router = inject(Router);
  messageService = inject(MessageService)

  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    });
  }
    onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.login(username, password)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.error || error.error.message, life: 3000 });

          this.isLoading = false;

          if (error.error.tempToken) {
            setTimeout(() => {
              this.router.navigate(['/verify-whatsapp']);
            }, 2000);
          }

        }
      });
  }

}
