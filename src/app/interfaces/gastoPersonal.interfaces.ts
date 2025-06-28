export interface GPReq {
  concepto: string;
  monto:    number;
  empleado: string;
}

export interface GPRes {
  success: boolean;
  message: string;
  data:    DataGasto;
}

export interface DataGasto {
  concepto:  string;
  monto:     number;
  deleted:   boolean;
  empleado:  EmpleadoGasto;
  _id:       string;
  createdAt: Date;
}

export interface EmpleadoGasto {
  _id:       string;
  nombres:   string;
  apellidos: string;
}

export interface GPsRes {
  success: boolean;
  message: string;
  data:    DataGasto[];
}
