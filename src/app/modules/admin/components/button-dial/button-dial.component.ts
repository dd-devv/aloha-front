import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SpeedDial } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button-dial',
  imports: [SpeedDial],
  templateUrl: './button-dial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDialComponent implements OnInit {
  private router = inject(Router);
  items: MenuItem[] = [];

  ngOnInit(): void {
    this.items = [
      {
        label: 'Cerrar sesión',
        styleClass: 'text-red-500',
        icon: 'pi pi-sign-out',
        command: () => {
          //TODO: Implementar logout
        },
      },
      {
        label: 'Datos de tienda',
        icon: 'pi pi pi-building',
        command: () => {
          this.router.navigate(['/admin/datos-tienda']);
        },
      },
      {
        label: 'Cierre de caja',
        icon: 'pi pi-lock',
        command: () => {
          this.router.navigate(['/admin/cierre-caja']);
        },
      },
      {
        label: 'Gráficas',
        icon: 'pi pi-chart-bar',
        command: () => {
          this.router.navigate(['/admin/graficas']);
        },
      },
      {
        label: 'Reportes',
        icon: 'pi pi-folder',
        command: () => {
          this.router.navigate(['/admin/reportes']);
        },
      },
      {
        label: 'Ventas',
        icon: 'pi pi-check-square',
        command: () => {
          this.router.navigate(['/admin/ventas']);
        },
      },
      {
        label: 'Promociones',
        icon: 'pi pi-tag',
        command: () => {
          this.router.navigate(['/admin/promociones']);
        },
      },
      {
        label: 'Notas de venta',
        icon: 'pi pi-receipt',
        command: () => {
          this.router.navigate(['/admin/notas-venta']);
        },
      },
      {
        label: 'Platos y bebidas',
        icon: 'pi pi-chart-pie',
        command: () => {
          this.router.navigate(['/admin/platos']);
        },
      },
      {
        label: 'Almacén',
        icon: 'pi pi-objects-column',
        command: () => {
          this.router.navigate(['/admin/almacen']);
        },
      },
      {
        label: 'Productos',
        icon: 'pi pi-shopping-bag',
        command: () => {
          this.router.navigate(['/admin/productos']);
        },
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-users',
        command: () => {
          this.router.navigate(['/admin/usuarios']);
        },
      },
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['/admin']);
        },
      }
    ];
  }
}
