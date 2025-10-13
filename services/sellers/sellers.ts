// Serviço para gerenciar vendedores

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  commission?: number;
  disabled: boolean;
  profilePicture?: string;
  rule: string;
  affiliated_to?: string;
  unitName?: string;
  masterUid?: string;
  createdAt: string;
  uid: string;
}

export interface CreateSellerData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  commission?: number;
  affiliated_to?: string;
  unitName?: string;
  profilePicture?: string;
  masterUid?: string;
}

export interface UpdateSellerData {
  sellerId: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  oldEmail?: string;
  commission?: number;
}

/**
 * Busca todos os vendedores de um usuário específico
 */
export async function fetchSellersService(
  userId: string
): Promise<Seller[]> {
  try {
    const response = await fetch(`/api/sellers?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao buscar vendedores");
    }

    const data = await response.json();
    return data.sellers;
  } catch (error: any) {
    console.error("Erro ao buscar vendedores:", error);
    throw new Error(error.message || "Erro ao buscar vendedores");
  }
}

/**
 * Cria um novo vendedor
 */
export async function createSellerService(
  data: CreateSellerData
): Promise<{ message: string; userId: string }> {
  try {
    const response = await fetch("/api/sellers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar vendedor");
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Erro ao criar vendedor:", error);
    throw new Error(error.message || "Erro ao criar vendedor");
  }
}

/**
 * Ativa ou desativa um vendedor
 */
export async function toggleSellerActiveService(
  sellerId: string,
  disabled: boolean,
  email: string
): Promise<{ message: string }> {
  try {
    const response = await fetch("/api/sellers/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sellerId,
        email,
        disabled,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || "Erro ao atualizar status do vendedor"
      );
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Erro ao atualizar status do vendedor:", error);
    throw new Error(
      error.message || "Erro ao atualizar status do vendedor"
    );
  }
}

/**
 * Atualiza os dados de um vendedor
 */
export async function updateSellerService(
  data: UpdateSellerData
): Promise<{ message: string }> {
  try {
    const response = await fetch("/api/sellers/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao atualizar vendedor");
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Erro ao atualizar vendedor:", error);
    throw new Error(error.message || "Erro ao atualizar vendedor");
  }
}

