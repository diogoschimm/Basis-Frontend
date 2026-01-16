import { FormaCompraItemRequest } from './forma-compra.model';
import { AutorResponse } from './autor.model';
import { AssuntoResponse } from './assunto.model';

export interface LivroResponse {
  codigo: number;
  titulo: string | null;
  editora: string | null;
  edicao: number;
  anoPublicacao: string | null;
  autores?: AutorResponse[] | null;
  assuntos?: AssuntoResponse[] | null;
  formasCompra?: Array<{ formaCompraCodigo: number; valorCompra: number; descricao?: string | null }> | null;
}

export interface CriarLivroRequest {
  codigo: number;
  titulo: string;
  editora: string;
  edicao: number;
  anoPublicacao: string;
  autoresCodigos?: number[] | null;
  assuntosCodigos?: number[] | null;
  formasCompra?: FormaCompraItemRequest[] | null;
}

export interface AtualizarLivroRequest {
  codigo: number;
  titulo: string;
  editora: string;
  edicao: number;
  anoPublicacao: string;
}

