export interface AutorResponse {
  codigo: number;
  nome: string | null;
}

export interface CriarAutorRequest {
  codigo: number;
  nome: string;
}

export interface AtualizarAutorRequest {
  codigo: number;
  nome: string;
}

