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
  categoria:   string;
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

export interface PlatosChart {
  success: boolean;
  message: string;
  data:    DataPlatoChart;
}

export interface DataPlatoChart {
  platos: string[];
  ventas: number[];
}

export interface VentasChart {
  success: boolean;
  message: string;
  data:    DataVentaChart;
}

export interface DataVentaChart {
  fechas:      string[];
  sumVentas:   number[];
  inventarios: number[];
}

export interface FlujoCajaRes {
  success: boolean;
  message: string;
  data:    DataFlujo;
}

export interface DataFlujo {
  totalIngresos: number;
  totalEgresos:  number;
  balance:       number;
  detalle:       DetalleFlujo[];
}

export interface DetalleFlujo {
  fecha:            Date;
  platos:           PlatoFlujo[];
  egresos:          Egreso[];
  totalIngresosDia: number;
  totalEgresosDia:  number;
}

export interface Egreso {
  _id:       string;
  concepto:  string;
  monto:  number;
  createdAt: Date;
}

export interface PlatoFlujo {
  nombre:   string;
  precio:   number;
  cantidad: number;
  subtotal: number;
  imagen:   string;
}

export interface EstadoComandaRes {
  success: boolean;
  message: string;
  data:    Data;
}

export interface Data {
  data: boolean;
}
