// Formatar valores para exibição
export const formatToCurrency = (value: number) => {
    // Garantir que o valor é um número
    const numValue = Number(value);
    if (isNaN(numValue)) return "R$ 0,00";
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };