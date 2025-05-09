export interface PlatoResp {
  success: boolean;
  message: string;
  data:    Plato;
}

export interface Plato {
  nombre:    string;
  tipo:      string;
  precio:    number;
  codigo:    string;
  galeria:   string[];
  estado:    string;
  deleted:   boolean;
  _id:       string;
  createdAt: Date;
}

export interface PlatoRequest {
  nombre: string;
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
