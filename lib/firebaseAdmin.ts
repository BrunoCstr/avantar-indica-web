import * as admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENTEMAIL,
      privateKey: process.env.FIREBASE_PRIVATEKEY?.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

export default admin;
export const adminAuth = admin.auth();
export const adminDB = admin.firestore();
export const adminStorage = admin.storage();

export async function sendPushNotificationFCM(tokens: string[], payload: any) {
  if (!tokens.length) return { success: false, error: "No tokens provided" };
  try {
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data || {},
    });
    return { success: true, response };
  } catch (error) {
    return { success: false, error };
  }
}