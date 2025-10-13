import { db, auth } from "@/lib/firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { validatePassword } from "@/utils/validatePassword";

export interface NotificationPreferences {
  campaigns: boolean;
  status: boolean;
  withdraw: boolean;
  email?: boolean;
  whatsapp?: boolean;
  newIndications?: boolean;
  newWithdraw?: boolean;
}

// Função para verificar se o usuário está autenticado
async function checkAuthStatus() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Usuário não está autenticado");
  }
  
  // Verificar se o token é válido
  try {
    await currentUser.getIdToken(true);
  } catch (error) {
    throw new Error("Token de autenticação inválido");
  }
}

// Buscar preferências de notificação do usuário
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  await checkAuthStatus();
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const prefs = userData.notificationsPreferences;
      
      return {
        campaigns: prefs?.campaigns ?? true,
        status: prefs?.status ?? true,
        withdraw: prefs?.withdraw ?? true,
        email: prefs?.email ?? true,
        whatsapp: prefs?.whatsapp ?? true,
        newIndications: prefs?.newIndications ?? true,
        newWithdraw: prefs?.newWithdraw ?? true,
      };
    }
    
    // Retorna valores padrão se não existir
    return {
      campaigns: true,
      status: true,
      withdraw: true,
      email: true,
      whatsapp: true,
      newIndications: true,
      newWithdraw: true,
    };
  } catch (error) {
    console.error("Erro ao buscar preferências de notificação:", error);
    throw error;
  }
}

// Atualizar preferências de notificação
export async function updateNotificationPreferences(
  userId: string, 
  preferences: NotificationPreferences
): Promise<void> {
  await checkAuthStatus();
  
  try {
    await updateDoc(doc(db, "users", userId), {
      notificationsPreferences: preferences,
    });
  } catch (error) {
    console.error("Erro ao atualizar preferências de notificação:", error);
    throw error;
  }
}

// Alterar senha do usuário
export async function changeUserPassword(
  currentPassword: string, 
  newPassword: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    throw new Error("Usuário não autenticado");
  }

  try {
    // Validar força da nova senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Reautenticar o usuário com a senha atual
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);

    // Atualizar a senha
    await updatePassword(currentUser, newPassword);
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error);
    
    switch (error.code) {
      case "auth/wrong-password":
        throw new Error("Senha atual incorreta");
      case "auth/weak-password":
        throw new Error("A nova senha é muito fraca");
      case "auth/requires-recent-login":
        throw new Error("Requer login recente. Faça logout e login novamente");
      case "auth/too-many-requests":
        throw new Error("Muitas tentativas. Tente novamente mais tarde");
      default:
        throw new Error(error.message || "Erro ao alterar senha");
    }
  }
}

// Desativar conta do usuário
export async function deactivateAccount(userId: string): Promise<void> {
  await checkAuthStatus();
  
  try {
    await updateDoc(doc(db, "users", userId), {
      disabled: true,
      deactivatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao desativar conta:", error);
    throw error;
  }
}
