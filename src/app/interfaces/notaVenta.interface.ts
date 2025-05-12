export interface NotaVentaRes {
  success: boolean;
  message: string;
  data:    NotaVenta;
}

export interface NotaVenta {
  _id:                 string;
  nombreTienda:        string;
  direccionTienda:     string;
  tienda:              string;
  codigo:              string;
  PorcentajeDescuento: number;
  platos:              PlatoNV[];
  total:               number;
  mesa:               number;
  totalLetras:         string;
  estado:              string;
  deleted:             boolean;
  createdAt:           Date;
}

export interface PlatoNV {
  nombre:   string;
  precio:   number;
  cantidad: number;
  subtotal: number;
  _id:      string;
}

export interface NotasVentaRes {
  success: boolean;
  message: string;
  data:    NotaVenta[];
}

