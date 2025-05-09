export interface ProductRegisterReq {
  nombre:         string;
  unidades:       string;
  precioUnitario: number;
  codigo:         string;
  galeria:        string[];
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data:    Product;
}

export interface Product {
  nombre:         string;
  unidades:       string;
  precioUnitario: number;
  codigo:         string;
  galeria:        string[];
  deleted:        boolean;
  createdBy:      any;
  _id:            string;
  createdAt:      Date;
}

export interface GetProductsResp {
  success: boolean;
  message: string;
  data:    Product[];
}
