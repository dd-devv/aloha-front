import { Routes } from '@angular/router';
import { LayoutPublicComponent } from './modules/public/layout-public/layout-public.component';
import { AuthLayoutComponent } from './modules/auth/auth-layout/auth-layout.component';
import { LayoutAdminComponent } from './modules/admin/layout-admin/layout-admin.component';
import { adminGuard, barmanGuard, chefGuard, mozoGuard } from './guards/auth.guard';
import { alreadyAuthenticatedGuard } from './guards/already-authenticated.guard';
import LayoutMozoComponent from './modules/mozo/layout-mozo/layout-mozo.component';
import LayoutChefComponent from './modules/chef/layout-chef/layout-chef.component';
import LayoutBarmanComponent from './modules/barman/layout-barman/layout-barman.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutPublicComponent,
    canActivate: [alreadyAuthenticatedGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/public/pages/home/home.component')
      },
      {
        path: 'contacto',
        loadComponent: () => import('./modules/public/pages/contact/contact.component')
      }
    ]
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [alreadyAuthenticatedGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/auth/login/login.component')
      }
    ]
  },
  {
    path: 'admin',
    component: LayoutAdminComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/admin/pages/pendientes/pendientes.component')
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./modules/admin/pages/users/users.component')
      },
      {
        path: 'asistencia',
        loadComponent: () => import('./modules/admin/pages/asistencias/asistencias.component')
      },
      {
        path: 'productos',
        loadComponent: () => import('./modules/admin/pages/productos/productos.component')
      },
      {
        path: 'almacen',
        loadComponent: () => import('./modules/admin/pages/almacen/almacen.component')
      },
      {
        path: 'platos',
        loadComponent: () => import('./modules/admin/pages/platos/platos.component')
      },
      {
        path: 'notas-venta',
        loadComponent: () => import('./modules/admin/pages/notas-venta/notas-venta.component')
      },
      {
        path: 'promociones',
        loadComponent: () => import('./modules/admin/pages/promociones/promociones.component')
      },
      {
        path: 'ventas',
        loadComponent: () => import('./modules/admin/pages/ventas/ventas.component')
      },
      {
        path: 'reportes',
        loadComponent: () => import('./modules/admin/pages/reportes/reportes.component')
      },
      {
        path: 'graficas',
        loadComponent: () => import('./modules/admin/pages/graficas/graficas.component')
      },
      {
        path: 'cierre-caja',
        loadComponent: () => import('./modules/admin/pages/cierre-caja/cierre-caja.component')
      },
      {
        path: 'datos-tienda',
        loadComponent: () => import('./modules/admin/pages/datos-tienda/datos-tienda.component')
      }
    ]
  },
  {
    path: 'mozo',
    component: LayoutMozoComponent,
    canActivate: [mozoGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/mozo/pages/inicio-mozo/inicio-mozo.component')
      },
      {
        path: 'mesas',
        loadComponent: () => import('./modules/mozo/pages/mesas/mesas.component')
      },
      {
        path: 'editar-pedido',
        loadComponent: () => import('./modules/mozo/pages/edit-pedido/edit-pedido.component')
      }
    ]
  },
  {
    path: 'chef',
    component: LayoutChefComponent,
    canActivate: [chefGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/chef/pages/inicio-chef/inicio-chef.component')
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./modules/chef/pages/pedidos-chef/pedidos-chef.component')
      }
    ]
  },
  {
    path: 'barman',
    component: LayoutBarmanComponent,
    canActivate: [barmanGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/barman/pages/inicio-barman/inicio-barman.component')
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./modules/barman/pages/pedidos-barman/pedidos-barman.component')
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
