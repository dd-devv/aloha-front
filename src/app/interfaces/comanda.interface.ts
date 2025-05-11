export interface GetComandasRes {
  success: boolean;
  message: string;
  data:    DatumComanda[];
}

export interface DatumComanda {
  mesa:     number;
  comandas: Comanda[];
}

export interface Comanda {
  _id:       string;
  plato:     PlatoComanda;
  venta:     string,
  cantidad:  number;
  estado:    string;
  mesa:      number;
  deleted:   boolean;
  createdAt: Date;
}

export interface PlatoComanda {
  _id:     string;
  nombre:  string;
  tipo:    string;
  precio:  number;
  galeria: string[];
}

export interface UpdateComandaRes {
  success: boolean;
  message: string;
  data:    Comanda;
}

export interface UpdateComandaReq {
  estado: string;
}
