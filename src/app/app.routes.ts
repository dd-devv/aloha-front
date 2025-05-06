import { Routes } from '@angular/router';
import { LayoutPublicComponent } from './modules/public/layout-public/layout-public.component';
import { AuthLayoutComponent } from './modules/auth/auth-layout/auth-layout.component';
import { LayoutAdminComponent } from './modules/admin/layout-admin/layout-admin.component';
import { adminGuard } from './guards/auth.guard';
import { alreadyAuthenticatedGuard } from './guards/already-authenticated.guard';

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
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
