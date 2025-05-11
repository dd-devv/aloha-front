export interface VentaReq {
  platos: PlatoVentaReq[];
  mesa:   number;
}

export interface PlatoVentaReq {
  plato:    string;
  cantidad: number;
}

export interface VentaRes {
  success: boolean;
  message: string;
  data:    Venta;
}

export interface Venta {
  platos:      PlatoVenta[];
  cantidades:  any[];
  subtotal:    number;
  total:       number;
  numeroVenta: string;
  empleado:    string;
  promocion:   null;
  estado:      string;
  mesa:        number;
  deleted:     boolean;
  _id:         string;
  createdAt:   Date;
}

export interface PlatoVenta {
  plato:    string;
  nombre:   string;
  precio:   number;
  imagen:   string;
  cantidad: number;
  subtotal: number;
  _id:      string;
}

export interface GetVentasRes {
  success: boolean;
  message: string;
  data:    Venta[];
}
