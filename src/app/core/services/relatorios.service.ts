import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Reports`;

  exportarRelatorioAutoresLivrosPdf(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    
    return this.http.get(`${this.baseUrl}/autores-livros/pdf`, {
      headers,
      responseType: 'blob'
    });
  }
}

