import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (aberto) {
      <div class="modal-overlay" (click)="cancelar()">
        <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
          <h2>{{ titulo }}</h2>
          <p>{{ mensagem }}</p>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" (click)="cancelar()">Cancelar</button>
            <button type="button" class="btn-danger" (click)="confirmarAcao()">Confirmar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() aberto = false;
  @Input() titulo = 'Confirmação';
  @Input() mensagem = 'Deseja realmente remover este registro?';
  @Output() confirmar = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();

  confirmarAcao(): void {
    this.confirmar.emit();
  }

  cancelar(): void {
    this.fechar.emit();
  }
}

