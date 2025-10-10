export function formatToPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  console.log(formatToPercentage(0.32));   // "32,00%"
  console.log(formatToPercentage(0.755));  // "75,50%"