import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export interface PerformanceData {
  pendingIndications: number; // Indicações pendentes de contato
  ongoingOpportunities: number; // Oportunidades em andamento
  closedOpportunities: number; // Oportunidades fechadas
  pendingWithdrawals: number; // Solicitações de saque pendentes
  paidWithdrawals: number; // Solicitações de saque pagas
}

/**
 * Busca dados de performance do mês do usuário
 * @param userId ID do usuário
 * @returns Dados de performance
 */
export async function fetchPerformanceData(
  userId: string
): Promise<PerformanceData> {
  try {
    // Buscar indicações pendentes de contato
    const indicationsRef = collection(db, "indications");
    const indicationsQuery = query(
      indicationsRef,
      where("indicator_id", "==", userId),
      where("status", "==", "PENDENTE CONTATO")
    );
    const indicationsSnapshot = await getDocs(indicationsQuery);
    const pendingIndications = indicationsSnapshot.size;

    // Buscar oportunidades em andamento
    const opportunitiesRef = collection(db, "opportunities");
    const ongoingStatuses = [
      "CONTATO REALIZADO",
      "INICIO DE PROPOSTA",
      "PROPOSTA APRESENTADA",
      "AGUARDANDO CLIENTE",
      "AGUARDANDO PAGAMENTO",
    ];

    let ongoingOpportunities = 0;
    for (const status of ongoingStatuses) {
      const opportunitiesQuery = query(
        opportunitiesRef,
        where("indicator_id", "==", userId),
        where("status", "==", status)
      );
      const opportunitiesSnapshot = await getDocs(opportunitiesQuery);
      ongoingOpportunities += opportunitiesSnapshot.size;
    }

    // Buscar oportunidades fechadas
    const closedOpportunitiesQuery = query(
      opportunitiesRef,
      where("indicator_id", "==", userId),
      where("status", "==", "FECHADO")
    );
    const closedOpportunitiesSnapshot = await getDocs(closedOpportunitiesQuery);
    const closedOpportunities = closedOpportunitiesSnapshot.size;

    // Buscar solicitações de saque pendentes
    const withdrawalsRef = collection(db, "withdrawals");
    const pendingWithdrawalsQuery = query(
      withdrawalsRef,
      where("userId", "==", userId),
      where("status", "==", "SOLICITADO")
    );
    const pendingWithdrawalsSnapshot = await getDocs(pendingWithdrawalsQuery);
    const pendingWithdrawals = pendingWithdrawalsSnapshot.size;

    // Buscar solicitações de saque pagas
    const paidWithdrawalsQuery = query(
      withdrawalsRef,
      where("userId", "==", userId),
      where("status", "==", "PAGO")
    );
    const paidWithdrawalsSnapshot = await getDocs(paidWithdrawalsQuery);
    const paidWithdrawals = paidWithdrawalsSnapshot.size;

    return {
      pendingIndications,
      ongoingOpportunities,
      closedOpportunities,
      pendingWithdrawals,
      paidWithdrawals,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de performance:", error);
    throw new Error(
      "Não foi possível carregar os dados de performance. Tente novamente."
    );
  }
}

/**
 * Busca dados de performance do mês do usuário (filtrando pelo mês atual)
 * @param userId ID do usuário
 * @returns Dados de performance do mês
 */
export async function fetchMonthPerformanceData(
  userId: string
): Promise<PerformanceData> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Buscar indicações pendentes de contato do mês
    const indicationsRef = collection(db, "indications");
    const indicationsQuery = query(
      indicationsRef,
      where("indicator_id", "==", userId),
      where("status", "==", "PENDENTE CONTATO"),
      where("createdAt", ">=", startOfMonth),
      where("createdAt", "<=", endOfMonth)
    );
    const indicationsSnapshot = await getDocs(indicationsQuery);
    const pendingIndications = indicationsSnapshot.size;

    // Buscar oportunidades em andamento do mês
    const opportunitiesRef = collection(db, "opportunities");
    const ongoingStatuses = [
      "CONTATO REALIZADO",
      "INICIO DE PROPOSTA",
      "PROPOSTA APRESENTADA",
      "AGUARDANDO CLIENTE",
      "AGUARDANDO PAGAMENTO",
    ];

    let ongoingOpportunities = 0;
    for (const status of ongoingStatuses) {
      const opportunitiesQuery = query(
        opportunitiesRef,
        where("indicator_id", "==", userId),
        where("status", "==", status),
        where("createdAt", ">=", startOfMonth),
        where("createdAt", "<=", endOfMonth)
      );
      const opportunitiesSnapshot = await getDocs(opportunitiesQuery);
      ongoingOpportunities += opportunitiesSnapshot.size;
    }

    // Buscar oportunidades fechadas do mês
    const closedOpportunitiesQuery = query(
      opportunitiesRef,
      where("indicator_id", "==", userId),
      where("status", "==", "FECHADO"),
      where("createdAt", ">=", startOfMonth),
      where("createdAt", "<=", endOfMonth)
    );
    const closedOpportunitiesSnapshot = await getDocs(closedOpportunitiesQuery);
    const closedOpportunities = closedOpportunitiesSnapshot.size;

    // Buscar solicitações de saque pendentes do mês
    const withdrawalsRef = collection(db, "withdrawals");
    const pendingWithdrawalsQuery = query(
      withdrawalsRef,
      where("userId", "==", userId),
      where("status", "==", "SOLICITADO"),
      where("createdAt", ">=", startOfMonth),
      where("createdAt", "<=", endOfMonth)
    );
    const pendingWithdrawalsSnapshot = await getDocs(pendingWithdrawalsQuery);
    const pendingWithdrawals = pendingWithdrawalsSnapshot.size;

    // Buscar solicitações de saque pagas do mês
    const paidWithdrawalsQuery = query(
      withdrawalsRef,
      where("userId", "==", userId),
      where("status", "==", "PAGO"),
      where("createdAt", ">=", startOfMonth),
      where("createdAt", "<=", endOfMonth)
    );
    const paidWithdrawalsSnapshot = await getDocs(paidWithdrawalsQuery);
    const paidWithdrawals = paidWithdrawalsSnapshot.size;

    return {
      pendingIndications,
      ongoingOpportunities,
      closedOpportunities,
      pendingWithdrawals,
      paidWithdrawals,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de performance do mês:", error);
    throw new Error(
      "Não foi possível carregar os dados de performance. Tente novamente."
    );
  }
}

