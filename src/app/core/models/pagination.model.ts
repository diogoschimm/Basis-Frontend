import { AssuntoResponse } from './assunto.model';
import { AutorResponse } from './autor.model';
import { FormaCompraResponse } from './forma-compra.model';
import { LivroResponse } from './livro.model';

export interface PagedResult<T> {
  items: T[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type AssuntoResponsePagedResult = PagedResult<AssuntoResponse>;
export type AutorResponsePagedResult = PagedResult<AutorResponse>;
export type FormaCompraResponsePagedResult = PagedResult<FormaCompraResponse>;
export type LivroResponsePagedResult = PagedResult<LivroResponse>;

