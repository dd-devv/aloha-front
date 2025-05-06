import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { TokenStorageService } from './token-storage.service';
import { inject } from '@angular/core';
import { TokenPayload } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TokenDecoderService {
  private tokenStorage = inject(TokenStorageService);

  getDecodedToken(): TokenPayload | null {
    const token = this.tokenStorage.getToken();

    if (!token) {
      return null;
    }

    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserRole(): String {
    const decodedToken = this.getDecodedToken();
    return decodedToken!.role;
  }

  hasRole(role: String): boolean {
    const userRole = this.getUserRole();

    if (!userRole) {
      return false;
    }

    if (Array.isArray(role)) {
      return role.includes(userRole);
    }

    return userRole === role;
  }

  isTokenExpired(): boolean {
    const decodedToken = this.getDecodedToken();

    if (!decodedToken?.exp) {
      return true;
    }

    // Token exp is in seconds, Date.now() is in milliseconds
    return decodedToken.exp < Date.now() / 1000;
  }
}
