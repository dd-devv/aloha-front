import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChangeThemeComponent } from '../../../public/common/change-theme/change-theme.component';
import { ConfirmationService } from 'primeng/api';
import AuthService from '../../../../services/auth.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-inicio-barman',
  imports: [
    RouterLink,
    ChangeThemeComponent,
    ConfirmDialog,
    ButtonModule
  ],
  providers: [ConfirmationService],
  templateUrl: './inicio-barman.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InicioBarmanComponent {
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  confirm1(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Seguro que desea cerrar su sesión?',
      header: 'Cerrar sesión',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Sí, cerrar sesión',
        severity: 'danger'
      },
      accept: () => {
        this.authService.logout();
      },
      reject: () => {

      },
    });
  }
}
