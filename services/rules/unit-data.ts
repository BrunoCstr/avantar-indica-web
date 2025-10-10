import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export interface CommissioningParameters {
  cashbackPerProduct: {
    auto: number;
    consorcio: number;
    empresarial: number;
    vida: number;
  };
  commissionPerProduct: {
    auto: number;
    consorcio: number;
    empresarial: number;
    vida: number;
  };
  defaultCashback: number;
  defaultCommission: number;
}

export interface UnitData {
  unitId: string;
  name: string;
  bonusParameters: CommissioningParameters;
  updatedAt: any;
}

/**
 * Busca dados da unidade do usuário
 * @param unitId ID da unidade
 * @returns Dados da unidade
 */
export async function fetchUnitData(unitId: string): Promise<UnitData | null> {
  try {
    const unitsRef = collection(db, "units");
    const q = query(unitsRef, where("unitId", "==", unitId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        unitId: data.unitId,
        name: data.name,
        bonusParameters: data.bonusParameters || [],
        updatedAt: data.updatedAt,
      };
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados da unidade:", error);
    throw new Error(
      "Não foi possível carregar os dados da unidade. Tente novamente."
    );
  }
}

/**
 * Formata a regra do usuário para exibição
 * @param rule Regra do usuário
 * @returns Regra formatada
 */
export function formatRule(rule: string | undefined): string {
  switch (rule) {
    case "cliente_indicador":
      return "Cliente Indicador";
    case "parceiro_indicador":
      return "Parceiro Indicador";
    case "admin_franqueadora":
      return "Admin Franqueadora";
    case "admin_unidade":
      return "Admin Unidade";
    case "sub_indicador":
      return "Sub Indicador";
    default:
      return "Não Definida";
  }
}
