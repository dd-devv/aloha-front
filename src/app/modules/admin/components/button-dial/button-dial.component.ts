import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SpeedDial } from 'primeng/speeddial';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import AuthService from '../../../../services/auth.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Observable } from 'rxjs';
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-button-dial',
  imports: [SpeedDial, ConfirmDialog],
  providers: [ConfirmationService],
  templateUrl: './button-dial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDialComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  items: MenuItem[] = [];
  isDarkTheme$: Observable<boolean>;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }


  toggleTheme() {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Cerrar sesión',
        icon: 'text-lg pi pi-moon',
        command: () => {
          this.toggleTheme();
        },
      },
      {
        label: 'Cerrar sesión',
        icon: 'text-lg pi pi-sign-out',
        command: (event) => {
          this.confirm1(event.originalEvent!);
        },
      },
      {
        label: 'Datos de tienda',
        icon: 'text-lg pi pi-building',
        command: () => {
          this.router.navigate(['/admin/datos-tienda']);
        },
      },
      {
        label: 'Cierre de caja',
        icon: 'text-lg pi pi-lock',
        command: () => {
          this.router.navigate(['/admin/cierre-caja']);
        },
      },
      {
        label: 'Gráficas',
        icon: 'text-lg pi pi-chart-bar',
        command: () => {
          this.router.navigate(['/admin/graficas']);
        },
      },
      {
        label: 'Flujo de caja',
        icon: 'text-lg pi pi-arrow-right-arrow-left',
        command: () => {
          this.router.navigate(['/admin/flujo-caja']);
        },
      },
      // {
      //   label: 'Reportes',
      //   icon: 'text-lg pi pi-folder',
      //   command: () => {
      //     this.router.navigate(['/admin/reportes']);
      //   },
      // },
      {
        label: 'Ventas',
        icon: 'text-lg pi pi-dollar',
        command: () => {
          this.router.navigate(['/admin/ventas']);
        },
      },
      {
        label: 'Promociones',
        icon: 'text-lg pi pi-tag',
        command: () => {
          this.router.navigate(['/admin/promociones']);
        },
      },
      {
        label: 'Notas de venta',
        icon: 'text-lg pi pi-receipt',
        command: () => {
          this.router.navigate(['/admin/notas-venta']);
        },
      },
      {
        label: 'Platos y bebidas',
        icon: 'text-lg pi pi-chart-pie',
        command: () => {
          this.router.navigate(['/admin/platos']);
        },
      },
      {
        label: 'Almacén',
        icon: 'text-lg pi pi-objects-column',
        command: () => {
          this.router.navigate(['/admin/almacen']);
        },
      },
      {
        label: 'Categorías',
        icon: 'text-lg pi pi-list-check',
        command: () => {
          this.router.navigate(['/admin/categorias']);
        },
      },
      {
        label: 'Productos',
        icon: 'text-lg pi pi-shopping-bag',
        command: () => {
          this.router.navigate(['/admin/productos']);
        },
      },
      {
        label: 'Asistencias',
        icon: 'text-lg pi pi-check-square',
        command: () => {
          this.router.navigate(['/admin/asistencia']);
        },
      },
      {
        label: 'Usuarios',
        icon: 'text-lg pi pi-users',
        command: () => {
          this.router.navigate(['/admin/usuarios']);
        },
      },
      {
        label: 'Inicio',
        icon: 'text-lg pi pi-home',
        command: () => {
          this.router.navigate(['/admin']);
        },
      }
    ];
  }

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
