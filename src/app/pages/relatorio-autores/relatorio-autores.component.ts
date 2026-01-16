import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RelatoriosService, ErrorHandlerService } from '../../core/services';
import { AlertComponent } from '../../shared/components';

@Component({
  selector: 'app-relatorio-autores',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  templateUrl: './relatorio-autores.component.html'
})
export class RelatorioAutoresComponent {
  private relatoriosService = inject(RelatoriosService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  gerandoRelatorio = false;

  // Alertas
  alertaMensagem: string = '';
  alertaMostrar: boolean = false;
  alertaTipo: 'success' | 'error' | 'warning' | 'info' = 'error';

  gerarRelatorio(): void {
    this.gerandoRelatorio = true;
    
    this.relatoriosService.exportarRelatorioAutoresLivrosPdf().subscribe({
      next: (blob: Blob) => {
        // Criar URL do blob
        const url = window.URL.createObjectURL(blob);
        
        // Criar link temporário para download
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-autores-livros-${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.gerandoRelatorio = false;
        this.mostrarSucesso('Relatório gerado e baixado com sucesso!');
      },
      error: (err: HttpErrorResponse) => {
        this.gerandoRelatorio = false;
        this.mostrarErro(err);
      }
    });
  }

  mostrarErro(error: HttpErrorResponse): void {
    // Resetar estado antes de mostrar novo alerta
    this.alertaMostrar = false;
    this.cdr.markForCheck();
    
    // Usar setTimeout para garantir que o estado seja atualizado
    setTimeout(() => {
      const mensagens = this.errorHandler.extrairMensagensErro(error);
      this.alertaMensagem = mensagens.join('\n');
      this.alertaTipo = 'error';
      this.alertaMostrar = true;
      this.cdr.markForCheck();
    }, 0);
  }

  mostrarSucesso(mensagem: string): void {
    // Resetar estado antes de mostrar novo alerta
    this.alertaMostrar = false;
    this.cdr.markForCheck();
    
    // Usar setTimeout para garantir que o estado seja atualizado
    setTimeout(() => {
      this.alertaMensagem = mensagem;
      this.alertaTipo = 'success';
      this.alertaMostrar = true;
      this.cdr.markForCheck();
      
      // Auto-fechar após 3 segundos
      setTimeout(() => {
        this.alertaMostrar = false;
        this.cdr.markForCheck();
      }, 3000);
    }, 0);
  }
}

