export interface FormaCompraResponse {
  codigo: number;
  descricao: string | null;
}

export interface CriarFormaCompraRequest {
  codigo: number;
  descricao: string;
}

export interface AtualizarFormaCompraRequest {
  codigo: number;
  descricao: string;
}

export interface FormaCompraItemRequest {
  formaCompraCodigo: number;
  valorCompra: number;
}

