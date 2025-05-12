import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: string | Date): string {
    if (!value) {
      return '';
    }

    // Convertir el valor a un objeto Date si es un string
    const date = value instanceof Date ? value : new Date(value);

    // Obtener la diferencia de tiempo en segundos
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    // Verificar si la fecha es válida
    if (isNaN(seconds)) {
      return '';
    }

    // Definir intervalos en segundos
    const intervals = {
      día: 86400,    // 60 * 60 * 24
      hora: 3600,    // 60 * 60
      minuto: 60,
      segundo: 1
    };

    // Determinar el intervalo apropiado
    if (seconds < 0) {
      return 'En el futuro';
    } else if (seconds < 60) {
      return `Hace ${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / intervals.minuto);
      return `Hace ${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / intervals.hora);
      return `Hace ${hours}h`;
    } else {
      const days = Math.floor(seconds / intervals.día);
      return `Hace ${days}d`;
    }
  }
}
