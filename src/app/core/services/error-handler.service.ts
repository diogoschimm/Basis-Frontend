import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../models';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  /**
   * Extrai mensagens de erro de uma resposta HTTP
   */
  extrairMensagensErro(error: HttpErrorResponse): string[] {
    const mensagens: string[] = [];

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      mensagens.push(`Erro: ${error.error.message}`);
    } else {
      // Erro do lado do servidor
      const problemDetails = error.error as ProblemDetails;

      if (problemDetails?.errors) {
        // Erros de validação por campo
        Object.keys(problemDetails.errors).forEach(campo => {
          const errosCampo = problemDetails.errors![campo];
          if (Array.isArray(errosCampo)) {
            errosCampo.forEach(erro => mensagens.push(erro));
          }
        });
      } else if (problemDetails?.detail) {
        // Mensagem de detalhe
        mensagens.push(problemDetails.detail);
      } else if (problemDetails?.title) {
        // Título do erro
        mensagens.push(problemDetails.title);
      } else if (error.message) {
        // Mensagem padrão do erro HTTP
        mensagens.push(error.message);
      } else {
        // Mensagem genérica
        mensagens.push('Ocorreu um erro inesperado. Tente novamente.');
      }
    }

    // Se não encontrou nenhuma mensagem, usar uma genérica
    if (mensagens.length === 0) {
      mensagens.push('Ocorreu um erro inesperado. Tente novamente.');
    }

    return mensagens;
  }

  /**
   * Retorna uma mensagem única formatada com todas as mensagens de erro
   */
  formatarMensagemErro(error: HttpErrorResponse): string {
    const mensagens = this.extrairMensagensErro(error);
    return mensagens.join('\n');
  }
}

