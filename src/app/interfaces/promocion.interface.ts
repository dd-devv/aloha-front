export interface PromocionReq {
  codigo:      string;
  descuento:   number;
  montoMinimo:   number;
  fechaInicio: Date;
  fechaFin:    Date;
}

export interface PromocionResp {
  success: boolean;
  message: string;
  data:    Promocion;
}

export interface Promocion {
  codigo:      string;
  descuento:   number;
  montoMinimo:   number;
  fechaInicio: Date;
  fechaFin:    Date;
  deleted:     boolean;
  _id:         string;
  createdAt:   Date;
}

export interface GetPromocionesRes {
  success: boolean;
  message: string;
  data:    Promocion[];
}
