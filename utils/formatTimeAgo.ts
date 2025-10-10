/**
 * Formata um timestamp do Firestore ou Date para uma string de tempo relativo
 * Exemplos: "Agora", "5 minutos atrás", "2 horas atrás", "há 3 dias"
 */
export function formatTimeAgo(date: any): string {
  if (!date) return '';

  let dateObj: Date;

  // Converte timestamp do Firestore para Date
  if (date?.toDate && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (date?.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Menos de 1 minuto
  if (diffInSeconds < 60) {
    return 'Agora';
  }

  // Menos de 1 hora
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? 'há 1 minuto' : `há ${diffInMinutes} minutos`;
  }

  // Menos de 1 dia
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? 'há 1 hora' : `há ${diffInHours} horas`;
  }

  // Menos de 1 semana
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? 'Ontem' : `há ${diffInDays} dias`;
  }

  // Menos de 1 mês
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? 'há 1 semana' : `há ${diffInWeeks} semanas`;
  }

  // Menos de 1 ano
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? 'há 1 mês' : `há ${diffInMonths} meses`;
  }

  // Mais de 1 ano
  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? 'há 1 ano' : `há ${diffInYears} anos`;
}

