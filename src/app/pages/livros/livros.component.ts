import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LivrosService, AutoresService, AssuntosService, FormasCompraService, ErrorHandlerService } from '../../core/services';
import {
  LivroResponse,
  CriarLivroRequest,
  AtualizarLivroRequest,
  AutorResponse,
  AssuntoResponse,
  FormaCompraResponse,
  FormaCompraItemRequest
} from '../../core/models';
import { ConfirmModalComponent, AlertComponent } from '../../shared/components';
import { formatarMoedaBrasil, formatarInputDinheiro, removerMascaraDinheiro } from '../../core/utils';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-livros',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, AlertComponent],
  templateUrl: './livros.component.html'
})
export class LivrosComponent implements OnInit {
  private livrosService = inject(LivrosService);
  private autoresService = inject(AutoresService);
  private assuntosService = inject(AssuntosService);
  private formasCompraService = inject(FormasCompraService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  // Expor função de formatação para o template
  formatarMoeda = formatarMoedaBrasil;

  livros: LivroResponse[] | null = null;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  totalPages = 0;
  loading = true;

  // Formulário
  formularioAberto = false;
  editando = false;
  abaAtiva = 'principal';
  livroCodigo: number = 0; // Código do livro (usado apenas para edição)
  livroForm: CriarLivroRequest = {
    titulo: '',
    editora: '',
    edicao: 1,
    anoPublicacao: '',
    autoresCodigos: [],
    assuntosCodigos: [],
    formasCompra: []
  };

  // Listas para seleção
  todosAutores: AutorResponse[] = [];
  todosAssuntos: AssuntoResponse[] = [];
  todasFormasCompra: FormaCompraResponse[] = [];

  // Listas de itens adicionados (para exibição)
  assuntosAdicionados: AssuntoResponse[] = [];
  autoresAdicionados: AutorResponse[] = [];
  formasCompraAdicionadas: Array<{ formaCompraCodigo: number; valorCompra: number; descricao: string }> = [];

  // Forma de compra temporária
  formaCompraSelecionada: number | null = null;
  valorCompra: number = 0;
  valorCompraFormatado: string = '';

  // Seleções temporárias
  autorSelecionadoTemp: number | null = null;
  assuntoSelecionadoTemp: number | null = null;

  // Modal de confirmação
  confirmModalAberto = false;
  codigoParaExcluir: number | null = null;

  // Alertas
  alertaMensagem: string = '';
  alertaMostrar: boolean = false;
  alertaTipo: 'success' | 'error' | 'warning' | 'info' = 'error';

  ngOnInit(): void {
    this.carregarLivros();
  }

  carregarLivros(): void {
    this.loading = true;
    this.livrosService.listar(this.pageNumber, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.livros = [...(result.items || [])];
          this.totalCount = result.totalCount || 0;
          this.totalPages = result.totalPages || 0;
        },
        error: (err: HttpErrorResponse) => {
          this.mostrarErro(err);
        }
      });
  }

  abrirFormularioNovo(): void {
    this.editando = false;
    this.abaAtiva = 'principal';
    this.livroCodigo = 0;
    this.livroForm = {
      titulo: '',
      editora: '',
      edicao: 1,
      anoPublicacao: '',
      autoresCodigos: [],
      assuntosCodigos: [],
      formasCompra: []
    };
    this.assuntosAdicionados = [];
    this.autoresAdicionados = [];
    this.formasCompraAdicionadas = [];
    this.formaCompraSelecionada = null;
    this.valorCompra = 0;
    this.valorCompraFormatado = '';
    this.autorSelecionadoTemp = null;
    this.assuntoSelecionadoTemp = null;
    this.carregarListas();
    this.formularioAberto = true;
  }

  abrirFormularioEditar(livro: LivroResponse): void {
    this.editando = true;
    this.abaAtiva = 'principal';
    this.livroCodigo = livro.codigo;
    this.livroForm = {
      titulo: livro.titulo || '',
      editora: livro.editora || '',
      edicao: livro.edicao,
      anoPublicacao: livro.anoPublicacao || '',
      autoresCodigos: [],
      assuntosCodigos: [],
      formasCompra: []
    };
    this.assuntosAdicionados = [];
    this.autoresAdicionados = [];
    this.formasCompraAdicionadas = [];
    this.formaCompraSelecionada = null;
    this.valorCompra = 0;
    this.valorCompraFormatado = '';
    this.autorSelecionadoTemp = null;
    this.assuntoSelecionadoTemp = null;

    this.carregarListas();
    this.carregarDadosLivro(livro.codigo);
    this.formularioAberto = true;
  }

  carregarDadosLivro(codigo: number): void {
    this.livrosService.obterPorCodigo(codigo).subscribe({
      next: (livroCompleto) => {
        // Carregar autores
        if (livroCompleto.autores && livroCompleto.autores.length > 0) {
          this.autoresAdicionados = [...livroCompleto.autores];
          this.livroForm.autoresCodigos = livroCompleto.autores.map(a => a.codigo);
        }

        // Carregar assuntos
        if (livroCompleto.assuntos && livroCompleto.assuntos.length > 0) {
          this.assuntosAdicionados = [...livroCompleto.assuntos];
          this.livroForm.assuntosCodigos = livroCompleto.assuntos.map(a => a.codigo);
        }

        // Carregar formas de compra
        if (livroCompleto.formasCompra && livroCompleto.formasCompra.length > 0) {
          this.formasCompraAdicionadas = livroCompleto.formasCompra.map(fc => ({
            formaCompraCodigo: fc.formaCompraCodigo,
            valorCompra: fc.valorCompra,
            descricao: fc.descricao || ''
          }));
          this.livroForm.formasCompra = livroCompleto.formasCompra.map(fc => ({
            formaCompraCodigo: fc.formaCompraCodigo,
            valorCompra: fc.valorCompra
          }));
        }
      },
      error: (err: HttpErrorResponse) => this.mostrarErro(err)
    });
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.editando = false;
    this.abaAtiva = 'principal';
  }

  carregarListas(): void {
    // Carregar todos os autores
    this.autoresService.listar(1, 1000).pipe(
      finalize(() => {
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (result) => {
        this.todosAutores = result.items || [];
      }
    });

    // Carregar todos os assuntos
    this.assuntosService.listar(1, 1000).pipe(
      finalize(() => {
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (result) => {
        this.todosAssuntos = result.items || [];
      }
    });

    // Carregar todas as formas de compra
    this.formasCompraService.listar(1, 1000).pipe(
      finalize(() => {
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (result) => {
        this.todasFormasCompra = result.items || [];
      }
    });
  }

  // Autores
  adicionarAutor(): void {
    if (this.autorSelecionadoTemp) {
      const codigo = Number(this.autorSelecionadoTemp);
      const autor = this.todosAutores.find(a => a.codigo === codigo);
      if (autor) {
        // Verificar se já existe na lista de adicionados
        const jaExiste = this.autoresAdicionados.some(a => a.codigo === autor.codigo);
        if (!jaExiste) {
          if (this.editando) {
            // Se estiver editando, chamar API
            this.livrosService.adicionarAutores(this.livroCodigo, [autor.codigo])
              .pipe(
                finalize(() => {
                  this.cdr.markForCheck();
                })
              )
              .subscribe({
                next: (livroAtualizado) => {
                  // Atualizar listas locais
                  this.autoresAdicionados.push(autor);
                  if (!this.livroForm.autoresCodigos) {
                    this.livroForm.autoresCodigos = [];
                  }
                  this.livroForm.autoresCodigos.push(autor.codigo);
                  this.autorSelecionadoTemp = null;
                  // Recarregar dados do livro para garantir sincronização
                  this.carregarDadosLivro(this.livroCodigo);
                },
                error: (err: HttpErrorResponse) => this.mostrarErro(err)
              });
          } else {
            // Se não estiver editando, apenas atualizar localmente
            this.autoresAdicionados.push(autor);
            if (!this.livroForm.autoresCodigos) {
              this.livroForm.autoresCodigos = [];
            }
            this.livroForm.autoresCodigos.push(autor.codigo);
            this.autorSelecionadoTemp = null;
          }
        }
      }
    }
  }

  removerAutor(codigo: number): void {
    if (this.editando) {
      // Se estiver editando, chamar API
      this.livrosService.removerAutores(this.livroCodigo, [codigo]).pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: () => {
          // Remover da lista de adicionados
          const index = this.autoresAdicionados.findIndex(a => a.codigo === codigo);
          if (index > -1) {
            this.autoresAdicionados.splice(index, 1);
          }
          // Remover de livroForm.autoresCodigos
          if (this.livroForm.autoresCodigos) {
            const codigoIndex = this.livroForm.autoresCodigos.indexOf(codigo);
            if (codigoIndex > -1) {
              this.livroForm.autoresCodigos.splice(codigoIndex, 1);
            }
          }
          // Recarregar dados do livro para garantir sincronização
          this.carregarDadosLivro(this.livroCodigo);
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    } else {
      // Se não estiver editando, apenas atualizar localmente
      const index = this.autoresAdicionados.findIndex(a => a.codigo === codigo);
      if (index > -1) {
        this.autoresAdicionados.splice(index, 1);
      }
      if (this.livroForm.autoresCodigos) {
        const codigoIndex = this.livroForm.autoresCodigos.indexOf(codigo);
        if (codigoIndex > -1) {
          this.livroForm.autoresCodigos.splice(codigoIndex, 1);
        }
      }
    }
  }

  // Assuntos
  adicionarAssunto(): void {
    if (this.assuntoSelecionadoTemp) {
      const codigo = Number(this.assuntoSelecionadoTemp);
      const assunto = this.todosAssuntos.find(a => a.codigo === codigo);
      if (assunto) {
        // Verificar se já existe na lista de adicionados
        const jaExiste = this.assuntosAdicionados.some(a => a.codigo === assunto.codigo);
        if (!jaExiste) {
          if (this.editando) {
            // Se estiver editando, chamar API
            this.livrosService.adicionarAssuntos(this.livroCodigo, [assunto.codigo]).pipe(
              finalize(() => {
                this.cdr.markForCheck();
              })
            ).subscribe({
              next: () => {
                // Atualizar listas locais
                this.assuntosAdicionados.push(assunto);
                if (!this.livroForm.assuntosCodigos) {
                  this.livroForm.assuntosCodigos = [];
                }
                this.livroForm.assuntosCodigos.push(assunto.codigo);
                this.assuntoSelecionadoTemp = null;
                // Recarregar dados do livro para garantir sincronização
                this.carregarDadosLivro(this.livroCodigo);
              },
              error: (err: HttpErrorResponse) => this.mostrarErro(err)
            });
          } else {
            // Se não estiver editando, apenas atualizar localmente
            this.assuntosAdicionados.push(assunto);
            if (!this.livroForm.assuntosCodigos) {
              this.livroForm.assuntosCodigos = [];
            }
            this.livroForm.assuntosCodigos.push(assunto.codigo);
            this.assuntoSelecionadoTemp = null;
          }
        }
      }
    }
  }

  removerAssunto(codigo: number): void {
    if (this.editando) {
      // Se estiver editando, chamar API
      this.livrosService.removerAssuntos(this.livroCodigo, [codigo]).pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: () => {
          // Remover da lista de adicionados
          const index = this.assuntosAdicionados.findIndex(a => a.codigo === codigo);
          if (index > -1) {
            this.assuntosAdicionados.splice(index, 1);
          }
          // Remover de livroForm.assuntosCodigos
          if (this.livroForm.assuntosCodigos) {
            const codigoIndex = this.livroForm.assuntosCodigos.indexOf(codigo);
            if (codigoIndex > -1) {
              this.livroForm.assuntosCodigos.splice(codigoIndex, 1);
            }
          }
          // Recarregar dados do livro para garantir sincronização
          this.carregarDadosLivro(this.livroCodigo);
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    } else {
      // Se não estiver editando, apenas atualizar localmente
      const index = this.assuntosAdicionados.findIndex(a => a.codigo === codigo);
      if (index > -1) {
        this.assuntosAdicionados.splice(index, 1);
      }
      if (this.livroForm.assuntosCodigos) {
        const codigoIndex = this.livroForm.assuntosCodigos.indexOf(codigo);
        if (codigoIndex > -1) {
          this.livroForm.assuntosCodigos.splice(codigoIndex, 1);
        }
      }
    }
  }

  // Formas de Compra
  adicionarFormaCompra(): void {
    if (this.formaCompraSelecionada && this.valorCompra > 0) {
      const codigo = Number(this.formaCompraSelecionada);
      const formaCompra = this.todasFormasCompra.find(fc => fc.codigo === codigo);
      if (formaCompra) {
        // Verificar se já existe na lista de adicionados
        const jaExiste = this.formasCompraAdicionadas.some(
          fc => fc.formaCompraCodigo === codigo
        );
        if (!jaExiste) {
          const formaCompraItem: FormaCompraItemRequest = {
            formaCompraCodigo: codigo,
            valorCompra: this.valorCompra
          };

          if (this.editando) {
            // Se estiver editando, chamar API
            this.livrosService.adicionarFormasCompra(this.livroCodigo, [formaCompraItem]).pipe(
              finalize(() => {
                this.cdr.markForCheck();
              })
            ).subscribe({
              next: () => {
                // Atualizar listas locais
                this.formasCompraAdicionadas.push({
                  formaCompraCodigo: codigo,
                  valorCompra: this.valorCompra,
                  descricao: formaCompra.descricao || ''
                });
                if (!this.livroForm.formasCompra) {
                  this.livroForm.formasCompra = [];
                }
                this.livroForm.formasCompra.push(formaCompraItem);
                this.formaCompraSelecionada = null;
                this.valorCompra = 0;
                this.valorCompraFormatado = '';
                // Recarregar dados do livro para garantir sincronização
                this.carregarDadosLivro(this.livroCodigo);
              },
              error: (err: HttpErrorResponse) => this.mostrarErro(err)
            });
          } else {
            // Se não estiver editando, apenas atualizar localmente
            this.formasCompraAdicionadas.push({
              formaCompraCodigo: codigo,
              valorCompra: this.valorCompra,
              descricao: formaCompra.descricao || ''
            });
            if (!this.livroForm.formasCompra) {
              this.livroForm.formasCompra = [];
            }
            this.livroForm.formasCompra.push(formaCompraItem);
            this.formaCompraSelecionada = null;
            this.valorCompra = 0;
            this.valorCompraFormatado = '';
          }
        }
      }
    }
  }

  formatarValorCompra(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFormatado = formatarInputDinheiro(input.value);
    this.valorCompraFormatado = valorFormatado;
    this.valorCompra = removerMascaraDinheiro(valorFormatado);
  }

  removerFormaCompra(formaCompraCodigo: number): void {
    if (this.editando) {
      // Se estiver editando, chamar API
      this.livrosService.removerFormasCompra(this.livroCodigo, [formaCompraCodigo]).pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: () => {
          // Remover da lista de adicionados
          const index = this.formasCompraAdicionadas.findIndex(
            fc => fc.formaCompraCodigo === formaCompraCodigo
          );
          if (index > -1) {
            this.formasCompraAdicionadas.splice(index, 1);
          }
          // Remover de livroForm.formasCompra
          if (this.livroForm.formasCompra) {
            this.livroForm.formasCompra = this.livroForm.formasCompra.filter(
              fc => fc.formaCompraCodigo !== formaCompraCodigo
            );
          }
          // Recarregar dados do livro para garantir sincronização
          this.carregarDadosLivro(this.livroCodigo);
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    } else {
      // Se não estiver editando, apenas atualizar localmente
      const index = this.formasCompraAdicionadas.findIndex(
        fc => fc.formaCompraCodigo === formaCompraCodigo
      );
      if (index > -1) {
        this.formasCompraAdicionadas.splice(index, 1);
      }
      if (this.livroForm.formasCompra) {
        this.livroForm.formasCompra = this.livroForm.formasCompra.filter(
          fc => fc.formaCompraCodigo !== formaCompraCodigo
        );
      }
    }
  }

  salvar(): void {
    if (this.editando) {
      const request: AtualizarLivroRequest = {
        codigo: this.livroCodigo,
        titulo: this.livroForm.titulo,
        editora: this.livroForm.editora,
        edicao: this.livroForm.edicao,
        anoPublicacao: this.livroForm.anoPublicacao
      };
      this.livrosService.atualizar(request).subscribe({
        next: () => {
          this.mostrarSucesso('Livro atualizado com sucesso!');
          this.fecharFormulario();
          this.carregarLivros();
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    } else {
      const request: CriarLivroRequest = {
        titulo: this.livroForm.titulo,
        editora: this.livroForm.editora,
        edicao: this.livroForm.edicao,
        anoPublicacao: this.livroForm.anoPublicacao,
        autoresCodigos: this.livroForm.autoresCodigos || [],
        assuntosCodigos: this.livroForm.assuntosCodigos || [],
        formasCompra: this.livroForm.formasCompra || []
      };
      this.livrosService.criar(request).subscribe({
        next: () => {
          this.mostrarSucesso('Livro criado com sucesso!');
          this.fecharFormulario();
          this.carregarLivros();
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
      this.livrosService.remover(this.codigoParaExcluir).subscribe({
        next: () => {
          this.mostrarSucesso('Livro excluído com sucesso!');
          this.fecharConfirmModal();
          this.carregarLivros();
        },
        error: (err: HttpErrorResponse) => this.mostrarErro(err)
      });
    }
  }

  paginaAnterior(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.carregarLivros();
    }
  }

  proximaPagina(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.carregarLivros();
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
}
