export interface CategoriaRegisterReq {
  descripcion: string;
}

export interface CategoriaResponse {
  success: boolean;
  message: string;
  data: Categoria;
}

export interface Categoria {
  descripcion: string;
  deleted: boolean;
  _id: string;
  createdAt: Date;
}

export interface GetCategoriasResp {
  success: boolean;
  message: string;
  data: Categoria[];
}
