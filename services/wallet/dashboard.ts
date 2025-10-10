import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';

/**
 * Interface para resumo financeiro baseado em saques
 */
export interface WithdrawalSummary {
  receivedThisMonth: number;
  pendingWithdrawals: number;
  totalReceived: number;
}

/**
 * Interface para dados detalhados de comissões
 */
export interface DetailedCommissionData {
  label: string;
  value: number;
  count: number;
  startDate: any;
  endDate: any;
  formattedValue: string;
}

/**
 * Interface para dados do dashboard (gráfico)
 */
export interface DashboardData {
  week: DetailedCommissionData[];
  month: DetailedCommissionData[];
  year: DetailedCommissionData[];
}

/**
 * Obtém o saldo (balance) do usuário do Firestore
 * @param userId - ID do usuário
 * @returns Promise com o saldo do usuário
 */
export async function getUserBalance(userId: string): Promise<number> {
  try {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar o saldo');
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.warn('Usuário não encontrado:', userId);
      return 0;
    }

    const userData = userDoc.data();
    const balance = userData?.balance;

    // Verificar se o balance é um número válido
    if (typeof balance === 'number' && !isNaN(balance)) {
      return balance;
    }

    // Se não for um número válido, retornar 0
    console.warn('Balance inválido para usuário:', userId, 'Balance:', balance);
    return 0;
  } catch (error) {
    console.error('Erro ao buscar balance do usuário:', error);
    throw new Error('Falha ao carregar balance do usuário');
  }
}

/**
 * Formata valores monetários para o padrão brasileiro
 * @param value - Valor numérico
 * @returns String formatada em BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Inscreve-se para receber atualizações em tempo real do saldo do usuário
 * @param userId - ID do usuário
 * @param onUpdate - Callback chamado quando o saldo é atualizado
 * @param onError - Callback opcional para erros
 * @returns Função para cancelar a inscrição
 */
export function subscribeToUserBalance(
  userId: string,
  onUpdate: (balance: number) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId) {
    throw new Error('userId é obrigatório para monitorar o saldo');
  }

  // Como o Firebase SDK web não tem onSnapshot para documentos específicos da mesma forma
  // que o React Native, vamos usar uma estratégia de polling ou retornar uma função
  // que busca o saldo periodicamente
  
  // Primeira busca imediata
  getUserBalance(userId)
    .then(onUpdate)
    .catch(error => {
      if (onError) onError(error);
    });

  // Configurar polling a cada 30 segundos
  const intervalId = setInterval(async () => {
    try {
      const balance = await getUserBalance(userId);
      onUpdate(balance);
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, 30000); // 30 segundos

  // Retornar função de cleanup
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Obtém resumo financeiro baseado nas solicitações de saque
 * @param userId - ID do usuário
 * @returns Promise com resumo financeiro
 */
export async function getWithdrawalSummary(userId: string): Promise<WithdrawalSummary> {
  try {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar resumo de saques');
    }

    const withdrawalsRef = collection(db, 'withdrawals');
    const q = query(withdrawalsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    let receivedThisMonth = 0;
    let pendingWithdrawals = 0;
    let totalReceived = 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const amount = data.amount || 0;
      const status = data.status;

      // Total recebido: todas as solicitações PAGAS
      if (status === 'PAGO') {
        totalReceived += amount;

        // Recebido este mês: PAGO com updatedAt deste mês
        if (data.updatedAt) {
          const updatedDate = data.updatedAt.toDate();
          if (updatedDate >= monthStart) {
            receivedThisMonth += amount;
          }
        }
      }

      // Pendente de recebimento: status SOLICITADO
      if (status === 'SOLICITADO') {
        pendingWithdrawals += amount;
      }
    });

    return {
      receivedThisMonth,
      pendingWithdrawals,
      totalReceived,
    };
  } catch (error) {
    console.error('Erro ao buscar resumo de saques:', error);
    return {
      receivedThisMonth: 0,
      pendingWithdrawals: 0,
      totalReceived: 0,
    };
  }
}

/**
 * Função auxiliar para buscar comissões em um período específico
 */
async function getCommissionForDateRange(
  userId: string,
  startDate: Timestamp,
  endDate: Timestamp
): Promise<{ totalCommission: number; opportunitiesCount: number }> {
  try {
    const opportunitiesRef = collection(db, 'opportunities');
    const q = query(
      opportunitiesRef,
      where('indicator_id', '==', userId),
      where('status', '==', 'FECHADO'),
      where('createdAt', '>=', startDate),
      where('createdAt', '<', endDate)
    );

    const snapshot = await getDocs(q);

    let totalCommission = 0;
    let opportunitiesCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.commission && typeof data.commission === 'number') {
        totalCommission += data.commission;
        opportunitiesCount++;
      }
    });

    return { totalCommission, opportunitiesCount };
  } catch (error) {
    console.error('Erro ao buscar comissões para período:', error);
    return { totalCommission: 0, opportunitiesCount: 0 };
  }
}

/**
 * Obtém dados da semana (por dia)
 */
async function getWeekData(userId: string): Promise<DetailedCommissionData[]> {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Início da semana (domingo às 00:00)
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - dayOfWeek);
  weekStartDate.setHours(0, 0, 0, 0);

  // Fim da semana (sábado às 23:59:59.999)
  const weekEndDate = new Date(now);
  weekEndDate.setDate(now.getDate() + (6 - dayOfWeek));
  weekEndDate.setHours(23, 59, 59, 999);

  const daysOfWeek = eachDayOfInterval({
    start: weekStartDate,
    end: weekEndDate,
  });

  const weekData: DetailedCommissionData[] = [];
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  for (let i = 0; i < daysOfWeek.length; i++) {
    const day = daysOfWeek[i];
    const dayStart = Timestamp.fromDate(
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0)
    );
    const dayEnd = Timestamp.fromDate(
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
    );

    const { totalCommission, opportunitiesCount } = await getCommissionForDateRange(
      userId,
      dayStart,
      dayEnd
    );

    weekData.push({
      label: dayNames[i],
      value: totalCommission,
      count: opportunitiesCount,
      startDate: dayStart,
      endDate: dayEnd,
      formattedValue: formatCurrency(totalCommission),
    });
  }

  return weekData;
}

/**
 * Obtém dados do mês (por semana)
 */
async function getMonthData(userId: string): Promise<DetailedCommissionData[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const weeksOfMonth = eachWeekOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const monthData: DetailedCommissionData[] = [];

  for (let i = 0; i < weeksOfMonth.length; i++) {
    const weekStart = weeksOfMonth[i];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStartTimestamp = Timestamp.fromDate(weekStart);
    const weekEndTimestamp = Timestamp.fromDate(weekEnd);

    const { totalCommission, opportunitiesCount } = await getCommissionForDateRange(
      userId,
      weekStartTimestamp,
      weekEndTimestamp
    );

    monthData.push({
      label: `Semana ${i + 1}`,
      value: totalCommission,
      count: opportunitiesCount,
      startDate: weekStartTimestamp,
      endDate: weekEndTimestamp,
      formattedValue: formatCurrency(totalCommission),
    });
  }

  return monthData;
}

/**
 * Obtém dados do ano (por mês)
 */
async function getYearData(userId: string): Promise<DetailedCommissionData[]> {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const monthsOfYear = eachMonthOfInterval({
    start: yearStart,
    end: yearEnd,
  });

  const yearData: DetailedCommissionData[] = [];
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  for (let i = 0; i < monthsOfYear.length; i++) {
    const monthStart = monthsOfYear[i];
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthStartTimestamp = Timestamp.fromDate(monthStart);
    const monthEndTimestamp = Timestamp.fromDate(monthEnd);

    const { totalCommission, opportunitiesCount } = await getCommissionForDateRange(
      userId,
      monthStartTimestamp,
      monthEndTimestamp
    );

    yearData.push({
      label: monthNames[i],
      value: totalCommission,
      count: opportunitiesCount,
      startDate: monthStartTimestamp,
      endDate: monthEndTimestamp,
      formattedValue: formatCurrency(totalCommission),
    });
  }

  return yearData;
}

/**
 * Obtém dados de comissões por período (semana, mês, ano)
 * @param userId - ID do usuário
 * @returns Promise com dados do dashboard
 */
export async function getCommissionsByPeriod(userId: string): Promise<DashboardData> {
  try {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar comissões por período');
    }

    // Buscar dados para todos os períodos
    const [weekData, monthData, yearData] = await Promise.all([
      getWeekData(userId),
      getMonthData(userId),
      getYearData(userId),
    ]);

    return {
      week: weekData,
      month: monthData,
      year: yearData,
    };
  } catch (error) {
    console.error('Erro ao buscar comissões por período:', error);
    throw new Error('Falha ao carregar dados de comissão');
  }
}

/**
 * Obtém dados de comissão para um período específico
 * @param userId - ID do usuário
 * @param period - Período desejado
 * @returns Promise com dados do período
 */
export async function getCommissionForSpecificPeriod(
  userId: string,
  period: 'week' | 'month' | 'year'
): Promise<DetailedCommissionData[]> {
  const allData = await getCommissionsByPeriod(userId);

  switch (period) {
    case 'week':
      return allData.week;
    case 'month':
      return allData.month;
    case 'year':
      return allData.year;
    default:
      throw new Error('Período inválido');
  }
}

