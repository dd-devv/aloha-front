export interface TiendaReq {
  nombre:    string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  logo:      string;
  horaEntrada: number;
  tolerancia: number;
  numeroMesas: number;
}

export interface TiendaResp {
  success: boolean;
  message: string;
  data:    Tienda;
}

export interface Tienda {
  _id:       string;
  nombre:    string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  horaEntrada: number;
  tolerancia: number;
  numeroMesas: number;
  logo:      string;
  deleted:   boolean;
  createdAt: Date;
}
