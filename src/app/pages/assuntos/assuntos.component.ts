import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssuntosService } from '../../core/services';
import { AssuntoResponse, CriarAssuntoRequest, AtualizarAssuntoRequest } from '../../core/models';
import { ConfirmModalComponent } from '../../shared/components';

@Component({
  selector: 'app-assuntos',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './assuntos.component.html'
})
export class AssuntosComponent implements OnInit {
  private assuntosService = inject(AssuntosService);

  assuntos: AssuntoResponse[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;

  // Modal de formulário
  modalAberto = false;
  editando = false;
  assuntoForm: CriarAssuntoRequest = { codigo: 0, descricao: '' };

  // Modal de confirmação
  confirmModalAberto = false;
  codigoParaExcluir: number | null = null;

  ngOnInit(): void {
    this.carregarAssuntos();
  }

  carregarAssuntos(): void {
    this.assuntosService.listar(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.assuntos = result.items || [];
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
      },
      error: (err) => console.error('Erro ao carregar assuntos:', err)
    });
  }

  abrirModalNovo(): void {
    this.editando = false;
    this.assuntoForm = { codigo: 0, descricao: '' };
    this.modalAberto = true;
  }

  abrirModalEditar(assunto: AssuntoResponse): void {
    this.editando = true;
    this.assuntoForm = { codigo: assunto.codigo, descricao: assunto.descricao || '' };
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvar(): void {
    if (this.editando) {
      const request: AtualizarAssuntoRequest = this.assuntoForm;
      this.assuntosService.atualizar(request).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarAssuntos();
        },
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.assuntosService.criar(this.assuntoForm).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarAssuntos();
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
      this.assuntosService.remover(this.codigoParaExcluir).subscribe({
        next: () => {
          this.fecharConfirmModal();
          this.carregarAssuntos();
        },
        error: (err) => console.error('Erro ao excluir:', err)
      });
    }
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
