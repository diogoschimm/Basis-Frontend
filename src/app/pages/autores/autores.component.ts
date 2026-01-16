import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoresService } from '../../core/services';
import { AutorResponse, CriarAutorRequest, AtualizarAutorRequest } from '../../core/models';
import { ConfirmModalComponent } from '../../shared/components';
import { finalize } from 'rxjs/operators';

@Component({ 
  selector: 'app-autores',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './autores.component.html'
})
export class AutoresComponent implements OnInit {
  private autoresService = inject(AutoresService);
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
  autorForm: CriarAutorRequest = { codigo: 0, nome: '' };

  // Modal de confirmação
  confirmModalAberto = false;
  codigoParaExcluir: number | null = null;

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
        error: (err) => {
          console.error('Erro ao carregar autores:', err);
        }
      });
  }

  abrirModalNovo(): void {
    this.editando = false;
    this.autorForm = { codigo: 0, nome: '' };
    this.modalAberto = true;
  }

  abrirModalEditar(autor: AutorResponse): void {
    this.editando = true;
    this.autorForm = { codigo: autor.codigo, nome: autor.nome || '' };
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvar(): void {
    if (this.editando) {
      const request: AtualizarAutorRequest = this.autorForm;
      this.autoresService.atualizar(request).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarAutores();
        },
        error: (err) => console.error('Erro ao atualizar:', err)
      });
    } else {
      this.autoresService.criar(this.autorForm).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarAutores();
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
      this.autoresService.remover(this.codigoParaExcluir).subscribe({
        next: () => {
          this.fecharConfirmModal();
          this.carregarAutores();
        },
        error: (err) => console.error('Erro ao excluir:', err)
      });
    }
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
