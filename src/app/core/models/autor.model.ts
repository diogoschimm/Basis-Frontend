export interface AutorResponse {
  codigo: number;
  nome: string | null;
}

export interface CriarAutorRequest {
  nome: string;
}

export interface AtualizarAutorRequest {
  codigo: number;
  nome: string;
}

