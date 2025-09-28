import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumeroLetrasService {
  private unidades: string[] = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  private decenas: string[] = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  private especiales: string[] = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  private centenas: string[] = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  private convertirGrupo(n: number): string {
    let output = '';

    if (n === 100) {
      return 'CIEN';
    }

    if (n > 99) {
      output = this.centenas[Math.floor(n / 100)] + ' ';
      n = n % 100;
    }

    if (n > 19) {
      output += this.decenas[Math.floor(n / 10)];
      if (n % 10 !== 0) {
        output += ' Y ' + this.unidades[n % 10];
      }
    } else if (n > 9) {
      output += this.especiales[n - 10];
    } else if (n > 0) {
      output += this.unidades[n];
    }

    return output.trim();
  }

  numeroALetras(numero: number): string {
    if (typeof numero !== 'number' || isNaN(numero)) {
      return '';
    }

    const parteEntera: number = Math.floor(numero);
    const parteDecimal: number = Math.round((numero - parteEntera) * 100);

    if (parteEntera === 0) {
      return 'CERO CON ' + parteDecimal.toString().padStart(2, '0') + '/100 SOLES';
    }

    let resultado = '';
    if (parteEntera === 1) {
      resultado = 'UN';
    } else if (parteEntera === 1000000) {
      resultado = 'UN MILLON';
    } else {
      const millones = Math.floor(parteEntera / 1000000);
      const miles = Math.floor((parteEntera % 1000000) / 1000);
      const resto = parteEntera % 1000;

      if (millones > 0) {
        resultado += this.convertirGrupo(millones) + (millones === 1 ? ' MILLON ' : ' MILLONES ');
      }

      if (miles > 0) {
        resultado += this.convertirGrupo(miles) + ' MIL ';
      }

      if (resto > 0) {
        resultado += this.convertirGrupo(resto);
      }
    }

    return resultado.trim() + ' CON ' + parteDecimal.toString().padStart(2, '0') + '/100 SOLES';
  }
}
