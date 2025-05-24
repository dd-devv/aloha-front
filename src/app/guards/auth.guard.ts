import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import AuthService from '../services/auth.service';
import { TokenDecoderService } from '../services/token-decoder.service';
import { Roles } from '../interfaces';

// Guard base para autenticación
export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En SSR, permitimos el acceso para que se renderice la página
  // La verificación real se realizará en el cliente
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Esperar a que se complete la verificación de autenticación
  const isAuthenticated = await firstValueFrom(authService.checkAuthStatus());

  if (!isAuthenticated) {
    // Guardar la URL que el usuario intentaba visitar
    const redirectUrl = state.url;
    router.navigate(['/login']);
    return false;
  }

  return true;
};

// Guard para roles específicos
export const roleGuard = (allowedRoles: String): CanActivateFn => {
  return async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const tokenService = inject(TokenDecoderService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    const authService = inject(AuthService);

    // En SSR, permitimos el acceso para que se renderice la página
    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    // Primero verificamos que esté autenticado (esperar la verificación)
    const isAuthenticated = await firstValueFrom(authService.checkAuthStatus());

    if (!isAuthenticated) {
      const redirectUrl = state.url;
      router.navigate(['/login'], { queryParams: { returnUrl: redirectUrl } });
      return false;
    }

    // Verificar si el token está expirado
    if (tokenService.isTokenExpired()) {
      authService.logout();
      router.navigate(['/login']);
      return false;
    }

    // Verificar el rol
    if (!tokenService.hasRole(allowedRoles)) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};

// Guards específicos para cada rol
export const adminGuard: CanActivateFn = roleGuard(Roles.ADMIN);
export const mozoGuard: CanActivateFn = roleGuard(Roles.MOZO);
export const chefGuard: CanActivateFn = roleGuard(Roles.CHEF);
export const barmanGuard: CanActivateFn = roleGuard(Roles.BARMAN);
