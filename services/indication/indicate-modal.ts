import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { IndicationSchema } from "@/lib/validationSchemas";

// Interface para os produtos
export interface Product {
  name: string;
  id?: string;
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
 * Envia uma indicação para o Firestore
 * @param data Dados do formulário de indicação
 * @param userData Dados do usuário autenticado
 * @returns Promise<void>
 */
export async function submitIndication(
  data: IndicationSchema,
  userData: {
    uid: string;
    displayName: string;
    profilePicture: string;
    affiliated_to: string;
    unitName: string;
  }
): Promise<void> {
  try {
    // Limpar telefone removendo caracteres não numéricos
    const cleanedPhone = data.phone.replace(/\D/g, "");

    // Criar referência para nova indicação
    const indicationRef = doc(collection(db, "indications"));

    // Salvar indicação no Firestore
    await setDoc(indicationRef, {
      indicator_id: userData.uid,
      indicator_name: userData.displayName,
      profilePicture: userData.profilePicture,
      indicationId: indicationRef.id,
      unitId: userData.affiliated_to,
      unitName: userData.unitName,
      name: data.fullName,
      email: data.email || "",
      phone: cleanedPhone,
      product: data.product,
      observations: data.observations || "",
      createdAt: serverTimestamp(),
      status: "PENDENTE CONTATO",
      sgcorId: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao enviar a indicação:", error);
    throw new Error("Não foi possível enviar a indicação. Tente novamente.");
  }
}

