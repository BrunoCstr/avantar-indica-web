/**
 * Aplica máscara de telefone brasileiro
 * @param value - Valor a ser mascarado (apenas números)
 * @returns String com máscara aplicada
 */
export function applyMaskTelephone(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, "");

  // Aplica a máscara dependendo do tamanho
  if (numbers.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 14);
  } else {
    // Celular: (XX) XXXXX-XXXX
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  }
}

/**
 * Remove a máscara do telefone
 * @param phone - Telefone com máscara
 * @returns String apenas com números
 */
export function removePhoneMask(phone: string): string {
  return phone.replace(/\D/g, "");
}

