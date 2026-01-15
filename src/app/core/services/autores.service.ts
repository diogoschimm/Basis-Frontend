import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AutorResponse,
  AutorResponsePagedResult,
  CriarAutorRequest,
  AtualizarAutorRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AutoresService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Autores`;

  listar(pageNumber = 1, pageSize = 10): Observable<AutorResponsePagedResult> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<AutorResponsePagedResult>(this.baseUrl, { params });
  }

  obterPorCodigo(codigo: number): Observable<AutorResponse> {
    return this.http.get<AutorResponse>(`${this.baseUrl}/${codigo}`);
  }

  criar(request: CriarAutorRequest): Observable<AutorResponse> {
    return this.http.post<AutorResponse>(this.baseUrl, request);
  }

  atualizar(request: AtualizarAutorRequest): Observable<AutorResponse> {
    return this.http.put<AutorResponse>(this.baseUrl, request);
  }

  remover(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codigo}`);
  }
}

