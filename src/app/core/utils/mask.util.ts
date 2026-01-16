/**
 * Formata um valor numérico como máscara de dinheiro brasileiro
 * @param valor - Valor numérico ou string
 * @returns String formatada como R$ 1.234,56
 */
export function mascararDinheiro(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') {
    return '';
  }

  const numero = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.')) : valor;
  
  if (isNaN(numero)) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

/**
 * Remove a formatação de dinheiro e retorna apenas o número
 * @param valorFormatado - String formatada como "R$ 1.234,56"
 * @returns Número (ex: 1234.56)
 */
export function removerMascaraDinheiro(valorFormatado: string): number {
  if (!valorFormatado) {
    return 0;
  }

  // Remove tudo exceto números, vírgula e ponto
  const limpo = valorFormatado.replace(/[^\d,.-]/g, '').replace(',', '.');
  const numero = parseFloat(limpo);
  
  return isNaN(numero) ? 0 : numero;
}

/**
 * Formata o valor enquanto o usuário digita (para inputs)
 * @param valor - String digitada pelo usuário
 * @returns String formatada
 */
export function formatarInputDinheiro(valor: string): string {
  if (!valor) {
    return '';
  }

  // Remove tudo exceto números
  const apenasNumeros = valor.replace(/\D/g, '');
  
  if (apenasNumeros === '') {
    return '';
  }

  // Converte para número e divide por 100 para ter centavos
  const numero = parseFloat(apenasNumeros) / 100;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

