import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cloudinaryImage',
  standalone: true
})
export class CloudinaryImagePipe implements PipeTransform {

  /**
   * Transforma una URL de Cloudinary aplicando ancho personalizado y formato AVIF
   *
   * @param url URL original de Cloudinary
   * @param width Ancho deseado en píxeles
   * @param options Opciones adicionales de transformación (opcional)
   * @returns URL transformada de Cloudinary
   */
  transform(url: string, width: number, type: 'avif' | 'webp' | 'jpeg', options?: { quality?: number }): string {
    if (!url || !url.includes('cloudinary.com') || !width) {
      return url; // Devuelve la URL original si no es válida o no es de Cloudinary
    }

    try {
      // Separa la URL en partes
      const urlParts = url.split('/upload/');
      if (urlParts.length !== 2) {
        return url; // No es una URL de Cloudinary estándar
      }

      // Construye los parámetros de transformación
      let transformations = `w_${width},f_${type}`;

      // Añade calidad si se especifica
      if (options?.quality && options.quality > 0 && options.quality <= 100) {
        transformations += `,q_${options.quality}`;
      }

      // Reconstruye la URL con las transformaciones
      return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
    } catch (error) {
      console.error('Error al transformar la URL de Cloudinary:', error);
      return url; // Devuelve la URL original en caso de error
    }
  }
}
