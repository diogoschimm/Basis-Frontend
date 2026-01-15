import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FormaCompraResponse,
  FormaCompraResponsePagedResult,
  CriarFormaCompraRequest,
  AtualizarFormaCompraRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FormasCompraService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/FormasCompra`;

  listar(pageNumber = 1, pageSize = 10): Observable<FormaCompraResponsePagedResult> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<FormaCompraResponsePagedResult>(this.baseUrl, { params });
  }

  obterPorCodigo(codigo: number): Observable<FormaCompraResponse> {
    return this.http.get<FormaCompraResponse>(`${this.baseUrl}/${codigo}`);
  }

  criar(request: CriarFormaCompraRequest): Observable<FormaCompraResponse> {
    return this.http.post<FormaCompraResponse>(this.baseUrl, request);
  }

  atualizar(request: AtualizarFormaCompraRequest): Observable<FormaCompraResponse> {
    return this.http.put<FormaCompraResponse>(this.baseUrl, request);
  }

  remover(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codigo}`);
  }
}

