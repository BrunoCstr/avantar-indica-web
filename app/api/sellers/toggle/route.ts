import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminAuth } from "@/lib/firebaseAdmin";

// POST - Ativar/Desativar vendedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, email, disabled } = body;

    if (!sellerId || !email || disabled === undefined) {
      return NextResponse.json(
        { error: "sellerId, email e disabled são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar status no Firebase Auth
    try {
      const user = await adminAuth.getUserByEmail(email);
      await adminAuth.updateUser(user.uid, {
        disabled: !disabled, // Inverte o status atual
      });
    } catch (error: any) {
      console.error("Erro ao atualizar usuário no Auth:", error);
      if (error.code === "auth/user-not-found") {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }
      throw error;
    }

    // Atualizar status no Firestore
    await adminDB.collection("users").doc(sellerId).update({
      disabled: !disabled,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: `Vendedor ${!disabled ? "desativado" : "ativado"} com sucesso`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao atualizar status do vendedor:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar status do vendedor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

