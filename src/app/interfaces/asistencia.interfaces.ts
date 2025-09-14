export interface AsistenciaReq {
  trabajador:   string;
  fechaEntrada: Date;
  falta:     boolean;
}

export interface AsistenciaResp {
  success: boolean;
  message: string;
  data:    Asistencia;
}

export interface Asistencia {
  trabajador:   any;
  fechaEntrada: Date;
  tardanza:     boolean;
  falta:     boolean;
  deleted:      boolean;
  _id:          string;
  createdAt:    Date;
}

export interface GetAsistenciasResp {
  success: boolean;
  message: string;
  data:    Asistencia[];
}
