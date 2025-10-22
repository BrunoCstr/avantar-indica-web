import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { MultiIndicationSchema } from "@/lib/validationSchemas";

// Interface para os produtos
export interface Product {
  name: string;
  id?: string;
}

// Interface para item da lista de indicações
export interface IndicationItem extends MultiIndicationSchema {
  id: string;
}

/**
 * Busca todos os produtos disponíveis no Firestore
 * @returns Array de produtos ordenados alfabeticamente
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    const productsList = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));

    // Ordenar produtos alfabeticamente em português
    const sortedProducts = productsList.sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR")
    );

    return sortedProducts;
  } catch (error) {
    console.error("Erro ao buscar os produtos:", error);
    throw new Error("Não foi possível carregar os produtos. Tente novamente.");
  }
}

/**
 * Envia múltiplas indicações para a Cloud Function que processa consentimento B2B
 * @param indications Lista de indicações a serem enviadas
 * @param userData Dados do usuário autenticado
 * @returns Resultado do envio com contagem de sucessos e erros
 */
export async function submitMultipleIndications(
  indications: IndicationItem[],
  userData: {
    uid: string;
    displayName: string;
    profilePicture: string;
    affiliated_to: string;
    unitName: string;
  }
): Promise<{
  successCount: number;
  errorCount: number;
  errors: string[];
}> {
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // URL da Cloud Function para envio de email de consentimento
  const CLOUD_FUNCTION_URL = "https://sendconsentemail-o2z256zv6a-uc.a.run.app";

  for (const indication of indications) {
    try {
      // Limpar telefone removendo caracteres não numéricos
      const cleanedPhone = indication.phone.replace(/\D/g, "");

      // Estrutura de dados para a Cloud Function (processo B2B)
      const consentRequestData = {
        indicator_id: userData.uid,
        indicator_name: userData.displayName,
        profilePicture: userData.profilePicture,
        unitId: userData.affiliated_to,
        unitName: userData.unitName,
        indicated_name: indication.fullName,
        indicated_email: indication.email || "",
        indicated_phone: cleanedPhone,
        product: indication.product,
        observations: indication.observations || "",
      };

      // Enviar para Cloud Function
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consentRequestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Falha ao enviar para ${indication.fullName}: ${errorText}`
        );
      }

      successCount++;
    } catch (error) {
      errorCount++;
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      errors.push(`${indication.fullName}: ${errorMessage}`);
      console.error(
        `Erro ao enviar convite para ${indication.fullName}:`,
        error
      );
    }
  }

  return {
    successCount,
    errorCount,
    errors,
  };
}

/**
 * Gera mensagem de resultado baseada no envio de indicações
 * @param successCount Número de sucessos
 * @param errorCount Número de erros
 * @param totalCount Total de indicações
 * @returns Objeto com título e descrição da mensagem
 */
export function getSubmitResultMessage(
  successCount: number,
  errorCount: number,
  totalCount: number
): {
  title: string;
  description: string;
  type: "success" | "partial" | "error";
} {
  if (successCount === totalCount) {
    // Todos os envios foram bem-sucedidos
    return {
      title: "Convites enviados!",
      description: `${successCount} convite${
        successCount > 1 ? "s" : ""
      } enviado${
        successCount > 1 ? "s" : ""
      } com sucesso! E-mails foram enviados para os indicados com solicitações de consentimento.`,
      type: "success",
    };
  } else if (successCount > 0) {
    // Alguns sucessos e alguns erros
    return {
      title: "Envio parcial",
      description: `${successCount} convite${
        successCount > 1 ? "s" : ""
      } enviado${successCount > 1 ? "s" : ""} com sucesso, mas ${errorCount} ${
        errorCount > 1 ? "falharam" : "falhou"
      }. Verifique os dados e tente novamente para ${
        errorCount > 1 ? "os que falharam" : "o que falhou"
      }.`,
      type: "partial",
    };
  } else {
    // Todos os envios falharam
    return {
      title: "Erro no envio",
      description:
        "Não foi possível enviar nenhum convite. Verifique os dados e sua conexão, então tente novamente.",
      type: "error",
    };
  }
}

