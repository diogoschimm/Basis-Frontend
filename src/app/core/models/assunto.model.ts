export interface AssuntoResponse {
  codigo: number;
  descricao: string | null;
}

export interface CriarAssuntoRequest {
  codigo: number;
  descricao: string;
}

export interface AtualizarAssuntoRequest {
  codigo: number;
  descricao: string;
}

