import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audio: HTMLAudioElement | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initAudio();
  }

  private initAudio(): void {
    // Solo inicializar el audio si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio();
      this.audio.src = '../../assets/sounds/bell.mp3';
      this.audio.load();
    }
  }

  playNotificationSound(): void {
    // Verificar si estamos en el navegador y si el audio está disponible
    if (isPlatformBrowser(this.platformId) && this.audio) {
      this.audio.currentTime = 0;
      this.audio.play()
        .catch(error => console.error('Error al reproducir el sonido:', error));
    }
  }
}
