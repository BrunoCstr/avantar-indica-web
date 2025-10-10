import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { formatToCurrency } from "@/utils/formatCurrency";
import { formatToPercentage } from "@/utils/formatPercentage";

// Datas dinâmicas dos cards
const now = new Date();
const firstDayOfMonth = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
const currentDayOfMonth = Timestamp.fromDate(new Date());

export async function getTotalIndicationsOfMonth(uid: string) {
  try {
    const indicationsRef = collection(db, "indications");
    const q = query(
      indicationsRef,
      where("userId", "==", uid),
      where("createdAt", ">=", firstDayOfMonth),
      where("createdAt", "<=", currentDayOfMonth)
    );
    const querySnapshot = await getCountFromServer(q);
    return querySnapshot.data().count;
  } catch (error) {
    console.error("Erro ao buscar total de indicações do mês:", error);
    return 0;
  }
}

export async function getTotalOpportunitiesOfMonth(uid: string) {
  try {
    const opportunitiesRef = collection(db, "opportunities");
    const q = query(
      opportunitiesRef,
      where("userId", "==", uid),
      where("createdAt", ">=", firstDayOfMonth),
      where("createdAt", "<=", currentDayOfMonth)
    );
    const querySnapshot = await getCountFromServer(q);
    return querySnapshot.data().count;
  } catch (error) {
    console.error("Erro ao buscar total de oportunidades do mês:", error);
    return 0;
  }
}

export async function getTotalCommissionOfMonth(uid: string) {
  try {
    const q = query(
      collection(db, "opportunities"),
      where("userId", "==", uid),
      where("createdAt", ">=", firstDayOfMonth),
      where("createdAt", "<", currentDayOfMonth),
      where("status", "==", "FECHADO"),
      where("productionCommission", "!=", null)
    );

    const snapshot = await getDocs(q);
    let totalCommission = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const commission = data.productionCommission;
      if (commission && typeof commission === "number") {
        totalCommission += commission;
      }
    });

    return totalCommission;
  } catch (error) {
    console.error("Erro ao buscar total de comissão do mês:", error);
    return 0;
  }
}

export async function getTotalConversionRateOfMonth(uid: string) {
  try {
    const [totalIndications, totalOpportunities] = await Promise.all([
      getTotalIndicationsOfMonth(uid),
      getTotalOpportunitiesOfMonth(uid),
    ]);

    if (totalIndications === 0) return 0;

    return (
      (Number(totalOpportunities) / Number(totalIndications)) *
      100
    ).toFixed(2);
  } catch (error) {
    console.error("Erro ao buscar total de taxa de conversão do mês:", error);
    return 0;
  }
}

export async function getAllCardsData(uid: string) {
  try {
    const results = await Promise.all([
      getTotalIndicationsOfMonth(uid),
      getTotalOpportunitiesOfMonth(uid),
      formatToCurrency(await getTotalCommissionOfMonth(uid)),
      formatToPercentage(Number(await getTotalConversionRateOfMonth(uid))),
    ]);

    return results;
  } catch (error) {
    console.error(
      "Erro ao buscar todas as informações dos cards do mês:",
      error
    );
    return [];
  }
}
