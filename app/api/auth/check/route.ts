import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // Verifica se existe token
    const sessionCookie = req.cookies.get("authToken")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Nenhum token de sessão encontrado" },
        { status: 401 }
      );
    }

    // Verifica se o cookie de sessão é válido
    let decodedClaims;

    try {
      decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (error: any) {
      // Token expirado ou inválido
      if (
        error.code === "auth/session-cookie-expired" ||
        error.code === "auth/session-cookie-revoked" ||
        error.code === "auth/argument-error"
      ) {
        return NextResponse.json(
          { error: "Token de sessão expirado ou inválido" },
          { status: 401 }
        );
      }
      throw error; // Re-throw outros erros
    }

    // Verifica se o usuário existe no banco de dados
    const userDoc = await adminDB
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Retorna os dados do usuário
    return NextResponse.json({
      userData: {
        displayName: userData?.fullName,
        email: userData?.email,
        affiliated_to: userData?.affiliated_to,
        uid: userData?.uid,
        profilePicture: userData?.profilePicture,
        phone: userData?.phone,
        rule: decodedClaims.rule,
        unitName: userData?.unitName,
        unitId: userData?.unitId,
        uiSettings: userData?.uiSettings || {
          sidebarCollapsed: false,
          theme: "light",
        },
      },
    });
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
