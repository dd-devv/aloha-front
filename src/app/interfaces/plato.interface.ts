export interface PlatoResp {
  success: boolean;
  message: string;
  data:    Plato;
}

export interface Plato {
  nombre:    string;
  categoria:    string;
  tipo:      string;
  precio:    number;
  codigo:    string;
  galeria:   string[];
  estado:    string;
  cantidad: number;
  deleted:   boolean;
  _id:       string;
  createdAt: Date;
}

export interface PlatoRequest {
  nombre: string;
  categoria: string;
  precio: number;
  codigo: string;
  galeria:   string[];
  tipo:   string;
  estado?:   string;
}

export interface GetPlatosResp {
  success: boolean;
  message: string;
  data:    Plato[];
}
