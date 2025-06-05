export interface GastoReq {
  concepto: string;
  monto: number;
}

export interface GastoRes {
  success: boolean;
  message: string;
  data:    Gasto;
}

export interface GastosRes {
  success: boolean;
  message: string;
  data:    Gasto[];
}

export interface Gasto {
  _id:       string;
  concepto:  string;
  monto:  number;
  deleted:   boolean;
  incluido_en_cierre:   boolean;
  createdBy:  any;
  createdAt: Date;
}
