import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LivroResponse,
  LivroResponsePagedResult,
  CriarLivroRequest,
  AtualizarLivroRequest,
  FormaCompraItemRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LivrosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Livros`;

  listar(pageNumber = 1, pageSize = 10): Observable<LivroResponsePagedResult> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<LivroResponsePagedResult>(this.baseUrl, { params });
  }

  obterPorCodigo(codigo: number): Observable<LivroResponse> {
    return this.http.get<LivroResponse>(`${this.baseUrl}/${codigo}`);
  }

  criar(request: CriarLivroRequest): Observable<LivroResponse> {
    return this.http.post<LivroResponse>(this.baseUrl, request);
  }

  atualizar(request: AtualizarLivroRequest): Observable<LivroResponse> {
    return this.http.put<LivroResponse>(this.baseUrl, request);
  }

  remover(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codigo}`);
  }

  // Autores
  adicionarAutores(codigo: number, autoresCodigos: number[]): Observable<LivroResponse> {
    return this.http.post<LivroResponse>(`${this.baseUrl}/${codigo}/autores`, autoresCodigos);
  }

  removerAutores(codigo: number, autoresCodigos: number[]): Observable<LivroResponse> {
    return this.http.delete<LivroResponse>(`${this.baseUrl}/${codigo}/autores`, { body: autoresCodigos });
  }

  // Assuntos
  adicionarAssuntos(codigo: number, assuntosCodigos: number[]): Observable<LivroResponse> {
    return this.http.post<LivroResponse>(`${this.baseUrl}/${codigo}/assuntos`, assuntosCodigos);
  }

  removerAssuntos(codigo: number, assuntosCodigos: number[]): Observable<LivroResponse> {
    return this.http.delete<LivroResponse>(`${this.baseUrl}/${codigo}/assuntos`, { body: assuntosCodigos });
  }

  // Formas de Compra
  adicionarFormasCompra(codigo: number, formasCompra: FormaCompraItemRequest[]): Observable<LivroResponse> {
    return this.http.post<LivroResponse>(`${this.baseUrl}/${codigo}/formas-compra`, formasCompra);
  }

  removerFormasCompra(codigo: number, formasCompraCodigos: number[]): Observable<LivroResponse> {
    return this.http.delete<LivroResponse>(`${this.baseUrl}/${codigo}/formas-compra`, { body: formasCompraCodigos });
  }
}

