import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormasCompraService, ErrorHandlerService } from '../../core/services';
import { FormaCompraResponse, CriarFormaCompraRequest, AtualizarFormaCompraRequest } from '../../core/models';
import { ConfirmModalComponent, AlertComponent } from '../../shared/components';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forma-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, AlertComponent],
  templateUrl: './forma-compra.component.html'
})
export class FormaCompraComponent implements OnInit {
  private formasCompraService = inject(FormasCompraService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  formasCompra: FormaCompraResponse[] | null = null;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;
  loading = true;

  // Modal de formulário
  modalAberto = false;
  editando = false;
  formaCompraCodigo: number = 0; // Código da forma de compra (usado apenas para edição)
  formaCompraForm: CriarFormaCompraRequest = { descricao: '' };

  // Modal de confirmação
  confirmModalAberto = false;
  codigoParaExcluir: number | null = null;

  // Alertas
  alertaMensagem: string = '';
  alertaMostrar: boolean = false;
  alertaTipo: 'success' | 'error' | 'warning' | 'info' = 'error';

  ngOnInit(): void {
    this.carregarFormasCompra();
  }

  carregarFormasCompra(): void {
    this.loading = true;
    this.formasCompraService.listar(this.pageNumber, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: (result) => {
          this.formasCompra = result.items || [];
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
    this.formaCompraCodigo = 0;
    this.formaCompraForm = { descricao: '' };
    this.modalAberto = true;
  }

  abrirModalEditar(formaCompra: FormaCompraResponse): void {
    this.editando = true;
    this.formaCompraCodigo = formaCompra.codigo;
    this.formaCompraForm = { descricao: formaCompra.descricao || '' };
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvar(): void {
    if (this.editando) {
      const request: AtualizarFormaCompraRequest = {
        codigo: this.formaCompraCodigo,
        descricao: this.formaCompraForm.descricao
      };
      this.formasCompraService.atualizar(request).subscribe({
        next: () => {
          this.mostrarSucesso('Forma de compra atualizada com sucesso!');
          this.fecharModal();
          this.carregarFormasCompra();
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    } else {
      this.formasCompraService.criar(this.formaCompraForm).subscribe({
        next: () => {
          this.mostrarSucesso('Forma de compra criada com sucesso!');
          this.fecharModal();
          this.carregarFormasCompra();
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
      this.formasCompraService.remover(this.codigoParaExcluir).subscribe({
        next: () => {
          this.mostrarSucesso('Forma de compra excluída com sucesso!');
          this.fecharConfirmModal();
          this.carregarFormasCompra();
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
      this.carregarFormasCompra();
    }
  }

  proximaPagina(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.carregarFormasCompra();
    }
  }
}
