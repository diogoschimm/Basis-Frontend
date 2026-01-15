import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssuntoResponse,
  AssuntoResponsePagedResult,
  CriarAssuntoRequest,
  AtualizarAssuntoRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssuntosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Assuntos`;

  listar(pageNumber = 1, pageSize = 10): Observable<AssuntoResponsePagedResult> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<AssuntoResponsePagedResult>(this.baseUrl, { params });
  }

  obterPorCodigo(codigo: number): Observable<AssuntoResponse> {
    return this.http.get<AssuntoResponse>(`${this.baseUrl}/${codigo}`);
  }

  criar(request: CriarAssuntoRequest): Observable<AssuntoResponse> {
    return this.http.post<AssuntoResponse>(this.baseUrl, request);
  }

  atualizar(request: AtualizarAssuntoRequest): Observable<AssuntoResponse> {
    return this.http.put<AssuntoResponse>(this.baseUrl, request);
  }

  remover(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codigo}`);
  }
}

