import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export interface UnitData {
  bonusParameters: {
    minWithdrawal: number;
    defaultCashback: number;
    defaultCommission: number;
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
  };
}

export async function getUnitData(unitId: string): Promise<UnitData | null> {
  try {
    const unitRef = doc(db, "units", unitId);
    const unitSnap = await getDoc(unitRef);
    
    if (unitSnap.exists()) {
      return unitSnap.data() as UnitData;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao buscar dados da unidade:", error);
    throw error;
  }
}

export async function getMinWithdrawal(unitId: string): Promise<number> {
  try {
    const unitData = await getUnitData(unitId);
    return unitData?.bonusParameters?.minWithdrawal || 700;
  } catch (error) {
    console.error("Erro ao buscar valor mínimo de saque:", error);
    return 700; // Valor padrão em caso de erro
  }
}
