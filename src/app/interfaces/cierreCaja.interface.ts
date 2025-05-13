export interface CierreCajaRes {
  fecha:                Date;
  horaRegistro:         Date;
  ventas:               string[];
  totalVentas:          number;
  ingresosAlmacen:      string[];
  totalIngresosAlmacen: number;
  egresosAlmacen:       string[];
  totalEgresosAlmacen:  number;
  balanceTotal:         number;
  cajero:               string;
  tipoCierre:           string;
  deleted:              boolean;
  _id:                  string;
  createdAt:            Date;
  updatedAt:            Date;
  __v:                  number;
}


export interface GetCierresCaja {
  data: DataCierre [];
}


export interface DataCierre {
  _id:                  string;
  fecha:                Date;
  horaRegistro:         Date;
  ventas:               VentaCc[];
  totalVentas:          number;
  ingresosAlmacen:      GresosAlmacen[];
  totalIngresosAlmacen: number;
  egresosAlmacen:       GresosAlmacen[];
  totalEgresosAlmacen:  number;
  balanceTotal:         number;
  cajero:               Cajero;
  tipoCierre:           string;
  deleted:              boolean;
  createdAt:            Date;
  updatedAt:            Date;
  __v:                  number;
}

export interface Cajero {
  _id:       string;
  nombres:   string;
  apellidos: string;
}

export interface GresosAlmacen {
  _id:      string;
  producto: string;
  cantidad: number;
  subtotal: number;
}

export interface VentaCc {
  _id:   string;
  total: number;
}
