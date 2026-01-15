import { FormaCompraItemRequest } from './forma-compra.model';

export interface LivroResponse {
  codigo: number;
  titulo: string | null;
  editora: string | null;
  edicao: number;
  anoPublicacao: string | null;
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

