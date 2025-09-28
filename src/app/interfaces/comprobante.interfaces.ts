export interface LatestSerieCorrelativeResp {
  message: string;
  data:    DataSerieCorrelative;
}

export interface DataSerieCorrelative {
  ultimo_serie:       string;
  ultimo_correlativo: string;
}

export interface InsertSunatResp {
  success: boolean;
  data:    DataSunat;
}

export interface DataSunat {
  status:     string;
  documentId: string;
}

export interface GetComprobantesResp {
  accion:   string;
  consulta: string;
  correcto: boolean;
  data:     ComprobanteData[];
  pagination: Pagination
}

export interface ComprobanteData {
  _id:                      string;
  id_usuario:               string;
  id_venta:                 null | string;
  razon_social_tienda:      string;
  nombre_comercial_tienda:  string;
  ruc_tienda:               string;
  direccion_tienda:         string;
  ciudad_tienda:            string;
  tipo_documento:           string;
  serie:                    string;
  correlativo:              string;
  nombre_cliente:           string;
  numero_documento_cliente: string;
  direccion_cliente:        string;
  fecha_emision:            Date;
  hora_emision:             string;
  productos:                any;
  documentId:               string;
  subtotal:                 number;
  igv:                      number;
  total:                    number;
  monto_letras:             string;
  comentarios:              string;
  createdAt:                Date;
  __v:                      number;
}

export interface Pagination {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
}
