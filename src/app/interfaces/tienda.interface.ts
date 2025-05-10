export interface TiendaReq {
  nombre:    string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  logo:      string;
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
  logo:      string;
  deleted:   boolean;
  createdAt: Date;
}
