import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import AuthService from '../services/auth.service';
import { Roles } from '../interfaces';

/**
 * Este guard impide que usuarios ya autenticados accedan a rutas como login o registro
 * y los redirige a su página principal según su rol
 */
export const alreadyAuthenticatedGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En SSR, permitimos el acceso para que se renderice la página
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Esperar a que se complete la verificación de autenticación
  const isAuthenticated = await firstValueFrom(authService.checkAuthStatus());

  // Si el usuario ya está autenticado, redirigir según su rol
  if (isAuthenticated) {
    const currentRole = authService.getCurrentRole();

    // Redirigir según el rol
    switch(currentRole) {
      case Roles.ADMIN:
        router.navigate(['/admin']);
        return false;
      case Roles.MOZO:
        router.navigate(['/mozo']);
        return false;
      case Roles.CHEF:
        router.navigate(['/chef']);
        return false;
      case Roles.BARMAN:
        router.navigate(['/barman']);
        return false;
      default:
        // Si por alguna razón el rol no está definido pero está autenticado
        router.navigate(['/dashboard']);
        return false;
    }
  }

  // Si no está autenticado, permitir acceso a las rutas protegidas por este guard
  return true;
};
