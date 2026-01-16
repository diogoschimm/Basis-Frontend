import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AutoresService, ErrorHandlerService } from '../../core/services';
import { AutorResponse, CriarAutorRequest, AtualizarAutorRequest } from '../../core/models';
import { ConfirmModalComponent, AlertComponent } from '../../shared/components';
import { finalize } from 'rxjs/operators';

@Component({ 
  selector: 'app-autores',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, AlertComponent],
  templateUrl: './autores.component.html'
})
export class AutoresComponent implements OnInit {
  private autoresService = inject(AutoresService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  autores: AutorResponse[] | null = null;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;
  loading = true;

  // Modal de formulário
  modalAberto = false;
  editando = false;
  autorCodigo: number = 0; // Código do autor (usado apenas para edição)
  autorForm: CriarAutorRequest = { nome: '' };

  // Modal de confirmação
  confirmModalAberto = false;
  codigoParaExcluir: number | null = null;

  // Alertas
  alertaMensagem: string = '';
  alertaMostrar: boolean = false;
  alertaTipo: 'success' | 'error' | 'warning' | 'info' = 'error';

  ngOnInit(): void { 
    this.carregarAutores();
  }

  carregarAutores(): void { 
    this.loading = true;

    this.autoresService.listar(this.pageNumber, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.autores = result.items || [];
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages;
        },
        error: (err: HttpErrorResponse) => {
          this.mostrarErro(err);
        }
      });
  }

  abrirModalNovo(): void {
    this.editando = false;
    this.autorCodigo = 0;
    this.autorForm = { nome: '' };
    this.modalAberto = true;
  }

  abrirModalEditar(autor: AutorResponse): void {
    this.editando = true;
    this.autorCodigo = autor.codigo;
    this.autorForm = { nome: autor.nome || '' };
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvar(): void {
    if (this.editando) {
      const request: AtualizarAutorRequest = {
        codigo: this.autorCodigo,
        nome: this.autorForm.nome
      };
      this.autoresService.atualizar(request).subscribe({
        next: () => {
          this.mostrarSucesso('Autor atualizado com sucesso!');
          this.fecharModal();
          this.carregarAutores();
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    } else {
      this.autoresService.criar(this.autorForm).subscribe({
        next: () => {
          this.mostrarSucesso('Autor criado com sucesso!');
          this.fecharModal();
          this.carregarAutores();
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
      this.autoresService.remover(this.codigoParaExcluir).subscribe({
        next: () => {
          this.mostrarSucesso('Autor excluído com sucesso!');
          this.fecharConfirmModal();
          this.carregarAutores();
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
      this.carregarAutores();
    }
  }

  proximaPagina(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.carregarAutores();
    }
  }
}
