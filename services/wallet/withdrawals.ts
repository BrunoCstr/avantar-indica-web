import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export interface WithdrawalRequest {
  withdrawId: string;
  userId: string;
  amount: number;
  status: 'PAGO' | 'RECUSADO' | 'SOLICITADO';
  createdAt: any;
  updatedAt: any;
  pixKey: string;
  profilePicture: string;
  fullName?: string;
  rule?: string;
  unitId?: string;
  unitName?: string;
}

/**
 * Obtém todas as solicitações de saque do usuário do Firestore
 * @param userId - ID do usuário
 * @returns Promise com array de solicitações de saque
 */
export async function getUserWithdrawals(
  userId: string
): Promise<WithdrawalRequest[]> {
  try {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar solicitações de saque');
    }

    const withdrawalsRef = collection(db, 'withdrawals');
    const q = query(
      withdrawalsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const withdrawals: WithdrawalRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      withdrawals.push({
        withdrawId: data.withdrawId || doc.id,
        userId: data.userId,
        amount: data.amount,
        status: data.status,
        profilePicture: data.profilePicture || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        pixKey: data.pixKey,
        fullName: data.fullName,
        rule: data.rule,
        unitId: data.unitId,
        unitName: data.unitName,
      });
    });

    return withdrawals;
  } catch (error) {
    console.error('Erro ao buscar solicitações de saque:', error);
    throw new Error('Falha ao buscar solicitações de saque');
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
 * Interface para criar uma nova solicitação de saque
 */
export interface CreateWithdrawalRequest {
  amount: number;
  fullName: string;
  pixKey: string | null;
  rule: string;
  unitId: string;
  unitName: string;
  userId: string;
  profilePicture: string;
}

/**
 * Cria uma solicitação de saque no Firestore
 * @param withdrawalData - Dados da solicitação de saque
 * @returns Promise com o ID da solicitação criada
 */
export async function createWithdrawalRequest(
  withdrawalData: CreateWithdrawalRequest
): Promise<string> {
  try {
    if (!withdrawalData.userId) {
      throw new Error('userId é obrigatório para criar solicitação de saque');
    }

    // Verificar se o usuário tem chave PIX cadastrada
    if (!withdrawalData.pixKey || withdrawalData.pixKey.trim() === '') {
      throw new Error('Chave PIX não cadastrada');
    }

    // Verificar se o valor é válido
    if (withdrawalData.amount < 700) {
      throw new Error('Valor mínimo para saque é R$ 700,00');
    }

    const userDocRef = doc(db, 'users', withdrawalData.userId);
    const withdrawalsRef = collection(db, 'withdrawals');
    const newWithdrawalRef = doc(withdrawalsRef);

    // Usar transação para garantir consistência dos dados
    await runTransaction(db, async (transaction) => {
      // Buscar o documento do usuário
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.balance || 0;

      // Verificar se o usuário tem saldo suficiente
      if (currentBalance < withdrawalData.amount) {
        throw new Error('Saldo insuficiente para realizar o saque');
      }

      // Calcular o novo saldo
      const newBalance = currentBalance - withdrawalData.amount;

      // Criar o documento da solicitação de saque
      const withdrawalDoc = {
        withdrawId: newWithdrawalRef.id,
        amount: withdrawalData.amount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        fullName: withdrawalData.fullName,
        pixKey: withdrawalData.pixKey,
        rule: withdrawalData.rule,
        status: 'SOLICITADO' as const,
        unitId: withdrawalData.unitId,
        unitName: withdrawalData.unitName,
        userId: withdrawalData.userId,
        profilePicture: withdrawalData.profilePicture,
      };

      // Criar o documento na coleção withdrawals
      transaction.set(newWithdrawalRef, withdrawalDoc);

      // Atualizar o saldo do usuário
      transaction.update(userDocRef, {
        balance: newBalance,
        updatedAt: serverTimestamp(),
      });
    });

    return newWithdrawalRef.id;
  } catch (error) {
    console.error('Erro ao criar solicitação de saque:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Falha ao criar solicitação de saque');
  }
}

/**
 * Inscreve-se para receber atualizações em tempo real das solicitações de saque
 * @param userId - ID do usuário
 * @param onUpdate - Callback chamado quando há atualizações
 * @param onError - Callback opcional para erros
 * @returns Função para cancelar a inscrição
 */
export function subscribeToUserWithdrawals(
  userId: string,
  onUpdate: (withdrawals: WithdrawalRequest[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId) {
    throw new Error('userId é obrigatório para monitorar solicitações de saque');
  }

  // Primeira busca imediata
  getUserWithdrawals(userId)
    .then(onUpdate)
    .catch(error => {
      if (onError) onError(error);
    });

  // Configurar polling a cada 30 segundos
  const intervalId = setInterval(async () => {
    try {
      const withdrawals = await getUserWithdrawals(userId);
      onUpdate(withdrawals);
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
 * Verifica se o usuário pode realizar um saque
 * @param balance - Saldo atual do usuário
 * @param amount - Valor que deseja sacar
 * @param pixKey - Chave PIX do usuário
 * @returns Objeto com informações sobre a possibilidade de saque
 */
export function canWithdraw(
  balance: number,
  amount: number,
  pixKey: string | null | undefined
): { canWithdraw: boolean; reason?: string } {
  // Verificar chave PIX
  if (!pixKey || pixKey.trim() === '') {
    return {
      canWithdraw: false,
      reason: 'Chave PIX não cadastrada',
    };
  }

  // Verificar valor mínimo
  if (amount < 700) {
    return {
      canWithdraw: false,
      reason: 'Valor mínimo para saque é R$ 700,00',
    };
  }

  // Verificar saldo
  if (balance < amount) {
    return {
      canWithdraw: false,
      reason: 'Saldo insuficiente',
    };
  }

  return { canWithdraw: true };
}

