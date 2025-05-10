export interface MovimientoReq {
  producto: string;
  cantidad: number;
  tipo:     string;
}

export interface MovimientoRes {
  success: boolean;
  message: string;
  data:    Movimiento;
}

export interface MovimientosRes {
  success: boolean;
  message: string;
  data:    Movimiento[];
}

export interface Movimiento {
  _id:       string;
  producto:  any;
  cantidad:  number;
  subtotal:  number;
  tipo:      string;
  deleted:   boolean;
  createdAt: Date;
}
