import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export interface IndicationChartDataItem {
  name: string;
  indications: number; // Número de indicações
  opportunities: number; // Número de oportunidades
  formattedIndications: string;
  formattedOpportunities: string;
}

export interface IndicationChartData {
  week: IndicationChartDataItem[];
  month: IndicationChartDataItem[];
  year: IndicationChartDataItem[];
}

/**
 * Busca dados de indicações e oportunidades do usuário para o gráfico
 * @param userId ID do usuário
 * @returns Dados formatados para o gráfico por período
 */
export async function fetchIndicationsChartData(
  userId: string
): Promise<IndicationChartData> {
  try {
    // Buscar todas as indicações do usuário
    const indicationsRef = collection(db, "indications");
    const q = query(indicationsRef, where("indicator_id", "==", userId));
    const querySnapshot = await getDocs(q);

    const indications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      status: doc.data().status || "PENDENTE CONTATO",
    }));

    // Gerar dados para a semana atual
    const weekData = generateWeekData(indications);

    // Gerar dados para o mês atual
    const monthData = generateMonthData(indications);

    // Gerar dados para o ano atual
    const yearData = generateYearData(indications);

    return {
      week: weekData,
      month: monthData,
      year: yearData,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de indicações:", error);
    throw new Error(
      "Não foi possível carregar os dados de indicações. Tente novamente."
    );
  }
}

/**
 * Gera dados da semana atual (domingo a sábado)
 */
function generateWeekData(indications: any[]): IndicationChartDataItem[] {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return days.map((day, index) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + index);
    const endOfDay = new Date(dayDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayIndications = indications.filter((ind) => {
      const indDate = new Date(ind.createdAt);
      return indDate >= dayDate && indDate <= endOfDay;
    });

    const opportunities = dayIndications.filter(
      (ind) =>
        ind.status !== "PENDENTE CONTATO" &&
        ind.status !== "SEM INTERESSE" &&
        ind.status !== "CANCELADO"
    ).length;

    return {
      name: day,
      indications: dayIndications.length,
      opportunities: opportunities,
      formattedIndications: `${dayIndications.length} indicaç${
        dayIndications.length === 1 ? "ão" : "ões"
      }`,
      formattedOpportunities: `${opportunities} oportunidade${
        opportunities === 1 ? "" : "s"
      }`,
    };
  });
}

/**
 * Gera dados do mês atual (por semanas)
 */
function generateMonthData(indications: any[]): IndicationChartDataItem[] {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const weeks: IndicationChartDataItem[] = [];

  let currentWeekStart = new Date(firstDayOfMonth);
  let weekNumber = 1;

  while (currentWeekStart <= lastDayOfMonth) {
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const weekIndications = indications.filter((ind) => {
      const indDate = new Date(ind.createdAt);
      return indDate >= currentWeekStart && indDate <= currentWeekEnd;
    });

    const opportunities = weekIndications.filter(
      (ind) =>
        ind.status !== "PENDENTE CONTATO" &&
        ind.status !== "SEM INTERESSE" &&
        ind.status !== "CANCELADO"
    ).length;

    weeks.push({
      name: `Semana ${weekNumber}`,
      indications: weekIndications.length,
      opportunities: opportunities,
      formattedIndications: `${weekIndications.length} indicaç${
        weekIndications.length === 1 ? "ão" : "ões"
      }`,
      formattedOpportunities: `${opportunities} oportunidade${
        opportunities === 1 ? "" : "s"
      }`,
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  // Garantir que sempre temos 5 semanas (preencher com zeros se necessário)
  while (weeks.length < 5) {
    weeks.push({
      name: `Semana ${weeks.length + 1}`,
      indications: 0,
      opportunities: 0,
      formattedIndications: "0 indicações",
      formattedOpportunities: "0 oportunidades",
    });
  }

  return weeks;
}

/**
 * Gera dados do ano atual (por meses)
 */
function generateYearData(indications: any[]): IndicationChartDataItem[] {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const now = new Date();
  const currentYear = now.getFullYear();

  return months.map((month, index) => {
    const startOfMonth = new Date(currentYear, index, 1);
    const endOfMonth = new Date(currentYear, index + 1, 0, 23, 59, 59, 999);

    const monthIndications = indications.filter((ind) => {
      const indDate = new Date(ind.createdAt);
      return indDate >= startOfMonth && indDate <= endOfMonth;
    });

    const opportunities = monthIndications.filter(
      (ind) =>
        ind.status !== "PENDENTE CONTATO" &&
        ind.status !== "SEM INTERESSE" &&
        ind.status !== "CANCELADO"
    ).length;

    return {
      name: month,
      indications: monthIndications.length,
      opportunities: opportunities,
      formattedIndications: `${monthIndications.length} indicaç${
        monthIndications.length === 1 ? "ão" : "ões"
      }`,
      formattedOpportunities: `${opportunities} oportunidade${
        opportunities === 1 ? "" : "s"
      }`,
    };
  });
}

