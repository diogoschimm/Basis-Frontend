import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AssuntosService, ErrorHandlerService } from '../../core/services';
import { AssuntoResponse, CriarAssuntoRequest, AtualizarAssuntoRequest } from '../../core/models';
import { ConfirmModalComponent, AlertComponent } from '../../shared/components';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-assuntos',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, AlertComponent],
  templateUrl: './assuntos.component.html'
})
export class AssuntosComponent implements OnInit {
  private assuntosService = inject(AssuntosService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  assuntos: AssuntoResponse[] | null = null;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;
  loading = true;

  // Modal de formulário
  modalAberto = false;
  editando = false;
  assuntoCodigo: number = 0; // Código do assunto (usado apenas para edição)
  assuntoForm: CriarAssuntoRequest = { descricao: '' };

  // Modal de confirmação
  confirmModalAberto = false;
  codigoParaExcluir: number | null = null;

  // Alertas
  alertaMensagem: string = '';
  alertaMostrar: boolean = false;
  alertaTipo: 'success' | 'error' | 'warning' | 'info' = 'error';

  ngOnInit(): void {
    this.carregarAssuntos();
  }

  carregarAssuntos(): void {
    this.loading = true;
    this.assuntosService.listar(this.pageNumber, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: (result) => {
          this.assuntos = [...(result.items || [])];
          this.totalCount = result.totalCount || 0;
          this.totalPages = result.totalPages || 0;
        },
        error: (err: HttpErrorResponse) => {
          this.mostrarErro(err);
        }
      });
  }

  abrirModalNovo(): void {
    this.editando = false;
    this.assuntoCodigo = 0;
    this.assuntoForm = { descricao: '' };
    this.modalAberto = true;
  }

  abrirModalEditar(assunto: AssuntoResponse): void {
    this.editando = true;
    this.assuntoCodigo = assunto.codigo;
    this.assuntoForm = { descricao: assunto.descricao || '' };
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvar(): void {
    if (this.editando) {
      const request: AtualizarAssuntoRequest = {
        codigo: this.assuntoCodigo,
        descricao: this.assuntoForm.descricao
      };
      this.assuntosService.atualizar(request).subscribe({
        next: () => {
          this.mostrarSucesso('Assunto atualizado com sucesso!');
          this.fecharModal();
          this.carregarAssuntos();
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    } else {
      this.assuntosService.criar(this.assuntoForm).subscribe({
        next: () => {
          this.mostrarSucesso('Assunto criado com sucesso!');
          this.fecharModal();
          this.carregarAssuntos();
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    }
  }

  abrirConfirmExcluir(codigo: number): void {
    this.codigoParaExcluir = codigo;
    this.confirmModalAberto = true;
  }

  fecharConfirmModal(): void {
    this.confirmModalAberto = false;
    this.codigoParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.codigoParaExcluir !== null) {
      this.assuntosService.remover(this.codigoParaExcluir).subscribe({
        next: () => {
          this.mostrarSucesso('Assunto excluído com sucesso!');
          this.fecharConfirmModal();
          this.carregarAssuntos();
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    }
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

  paginaAnterior(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.carregarAssuntos();
    }
  }

  proximaPagina(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.carregarAssuntos();
    }
  }
}
