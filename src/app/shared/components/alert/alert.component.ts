import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (mostrar && mensagem) {
      <div class="alert-overlay">
        <div class="alert alert-{{ tipo }}" role="alert">
          <div class="alert-content">
            @if (tipo === 'error') {
              <i class="bi bi-exclamation-triangle-fill"></i>
            } @else if (tipo === 'success') {
              <i class="bi bi-check-circle-fill"></i>
            } @else if (tipo === 'warning') {
              <i class="bi bi-exclamation-circle-fill"></i>
            } @else {
              <i class="bi bi-info-circle-fill"></i>
            }
            <span>{{ mensagem }}</span>
          </div>
          @if (fechavel) {
            <button type="button" class="alert-close" (click)="fechar()" aria-label="Fechar">
              <i class="bi bi-x"></i>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .alert-overlay {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .alert {
      padding: 16px 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
      min-width: 300px;
      max-width: 400px;
    }

    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
      word-wrap: break-word;
    }

    .alert-content i {
      font-size: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .alert-content span {
      white-space: pre-line;
      line-height: 1.5;
    }

    .alert-success {
      background-color: #d1e7dd;
      color: #0f5132;
      border: 1px solid #badbcc;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #842029;
      border: 1px solid #f5c2c7;
    }

    .alert-warning {
      background-color: #fff3cd;
      color: #664d03;
      border: 1px solid #ffecb5;
    }

    .alert-info {
      background-color: #d1ecf1;
      color: #055160;
      border: 1px solid #b8daff;
    }

    .alert-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: inherit;
      opacity: 0.7;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
    }

    .alert-close:hover {
      opacity: 1;
    }

    .alert-close i {
      font-size: 20px;
    }
  `]
})
export class AlertComponent implements OnChanges {
  @Input() tipo: AlertType = 'info';
  @Input() mensagem: string = '';
  @Input() mostrar: boolean = false;
  @Input() fechavel: boolean = true;
  @Output() fecharEvent = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    // Garantir que o alerta apareça quando mostrar mudar para true
    if (changes['mostrar'] && this.mostrar && this.mensagem) {
      // Forçar renderização
    }
  }

  fechar(): void {
    this.fecharEvent.emit();
  }
}

