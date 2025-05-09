import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = 'dtttoiss7'; // Usa tu cloud name correcto
  private uploadPreset = 'alohaImages'; // Tu preset sin firma
  private apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();

    // Parámetros obligatorios
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    // Parámetros opcionales PERMITIDOS en uploads unsigned
    formData.append('folder', 'aloha/images');

    return this.http.post(this.apiUrl, formData);
  }
}
