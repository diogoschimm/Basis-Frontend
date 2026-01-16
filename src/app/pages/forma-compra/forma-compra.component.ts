import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormasCompraService } from '../../core/services';
import { FormaCompraResponse, CriarFormaCompraRequest, AtualizarFormaCompraRequest } from '../../core/models';
import { ConfirmModalComponent } from '../../shared/components';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forma-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './forma-compra.component.html'
})
export class FormaCompraComponent implements OnInit {
  private formasCompraService = inject(FormasCompraService);
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
  formaCompraForm: CriarFormaCompraRequest = { codigo: 0, descricao: '' };

  // Modal de confirmação
  confirmModalAberto = false;
  codigoParaExcluir: number | null = null;

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
        error: (err) => {
          console.error('Erro ao carregar formas de compra:', err);
        }
      });
  }

  abrirModalNovo(): void {
    this.editando = false;
    this.formaCompraForm = { codigo: 0, descricao: '' };
    this.modalAberto = true;
  }

  abrirModalEditar(formaCompra: FormaCompraResponse): void {
    this.editando = true;
    this.formaCompraForm = { codigo: formaCompra.codigo, descricao: formaCompra.descricao || '' };
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvar(): void {
    if (this.editando) {
      const request: AtualizarFormaCompraRequest = this.formaCompraForm;
      this.formasCompraService.atualizar(request).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarFormasCompra();
        },
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.formasCompraService.criar(this.formaCompraForm).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarFormasCompra();
        },
        error: (err) => console.error('Erro ao criar:', err)
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
          this.fecharConfirmModal();
          this.carregarFormasCompra();
        },
        error: (err) => console.error('Erro ao excluir:', err)
      });
    }
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
