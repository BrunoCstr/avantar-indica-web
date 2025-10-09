import { db, auth } from "@/lib/firebaseConfig";
import {
  query,
  getCountFromServer,
  collection,
  where,
  orderBy,
  getDocs,
  writeBatch,
  serverTimestamp,
  doc,
  startAfter,
  limit,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

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

export async function getCounterUnredNotifications(userId: string) {
  // Verificar autenticação antes da consulta
  await checkAuthStatus();
  
  try {
    const counterUnredNotifications = await getCountFromServer(
      query(
        collection(db, "users", userId, "notifications"),
        where("read", "==", false)
      )
    );

    return counterUnredNotifications.data().count;
  } catch (error) {
    console.error("Erro ao buscar contador de notificações:", error);
  }
}

export async function getThreeLastNotifications(
  userId: string
): Promise<any[]> {
  // Verificar autenticação antes da consulta
  await checkAuthStatus();
  
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");

    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(3));

    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      notificationId: doc.id,
      ...doc.data(),
    }));

    return notifications;
  } catch (error) {
    console.error("Erro ao buscar últimas notificações:", error);
    throw error;
  }
}

export async function getNotifications(
  userId: string,
  pageSize: number,
  lastVisible: any | null
): Promise<{
  cursor: any | null;
  hasMore: boolean;
  data: any;
}> {
  // Verificar autenticação antes da consulta
  await checkAuthStatus();
  
  const limitCount = pageSize + 1;

  const filters = [orderBy("createdAt", "desc")] as const;

  // pede um a mais
  const constraints = lastVisible
    ? [...filters, startAfter(lastVisible), limit(limitCount)]
    : [...filters, limit(limitCount)];

  const snapshot = await getDocs(
    query(collection(db, "users", userId, "notifications"), ...constraints)
  );
  const docs = snapshot.docs;

  // se vierem mais que pageSize, existe próxima página
  const hasMore = docs.length > pageSize;
  const pageDocs = docs.slice(0, pageSize);
  const data = pageDocs.map((d) => {
    const pathSegments = d.ref.path.split("/");
    const userId = pathSegments[1];
    return { ...d.data(), notificationId: d.id, userId };
  });

  // cursor para próxima página (o (pageSize)-ésimo, se tiver)
  const cursor = hasMore ? docs[pageSize - 1] : null;

  return { data, cursor, hasMore };
}

export async function markAllNotificationsAsRead(userId: string) {
  // Verificar autenticação antes da consulta
  await checkAuthStatus();
  
  try {
    const notificationsRef = collection(db, "users", userId, "notifications");

    const q = query(notificationsRef, where("read", "==", false));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    querySnapshot.forEach((docSnapshot) => {
      const notificationRef = doc(
        db,
        "users",
        userId,
        "notifications",
        docSnapshot.id
      );
      batch.update(notificationRef, {
        read: true,
        readAt: timestamp,
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error);
    throw error;
  }
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
) {
  // Verificar autenticação antes da consulta
  await checkAuthStatus();
  
  try {
    const notificationRef = doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId
    );

    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    throw error;
  }
}

export async function markNotificationAsNotRead(
  userId: string,
  notificationId: string
) {
  // Verificar autenticação antes da consulta
  await checkAuthStatus();
  
  try {
    const notificationRef = doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId
    );

    await updateDoc(notificationRef, {
      read: false,
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como não lida:", error);
    throw error;
  }
}

export async function deleteNotification(
  userId: string,
  notificationId: string
) {
  // Verificar autenticação antes da consulta
  await checkAuthStatus();
  
  try {
    const notificationRef = doc(
      db,
      "users",
      userId,
      "notifications",
      notificationId
    );

    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error("Erro ao deletar notificação:", {
      error,
      userId,
      notificationId,
    });
    throw error;
  }
}
