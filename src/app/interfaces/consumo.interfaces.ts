import { PlatoVentaReq } from "./venta.interface";

export interface ConsumoReq {
  platos:     PlatoVentaReq[];
  empleadoId: string;
}

export interface ConsumoRes {
  success: boolean;
  message: string;
  data:    DataConsumo;
}

export interface DataConsumo {
  platos:    PlatoConsumo[];
  subtotal:  number;
  total:     number;
  admin:     UserConsumo;
  empleado:  UserConsumo;
  deleted:   boolean;
  _id:       string;
  createdAt: Date;
}

export interface UserConsumo {
  _id:       string;
  nombres:   string;
  apellidos: string;
}

export interface PlatoConsumo {
  plato:    string;
  nombre:   string;
  precio:   number;
  cantidad: number;
  imagen:   string;
  subtotal: number;
  _id:      string;
}

export interface GetConsumosResp {
  success: boolean;
  message: string;
  data:    DataConsumo[];
}

