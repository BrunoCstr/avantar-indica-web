import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminAuth } from "@/lib/firebaseAdmin";

// POST - Atualizar vendedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sellerId,
      fullName,
      email,
      phone,
      password,
      oldEmail,
      commission,
    } = body;

    if (!sellerId || !fullName || !email || !phone) {
      return NextResponse.json(
        { error: "sellerId, fullName, email e phone são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "E-mail inválido" },
        { status: 400 }
      );
    }

    // Validar comissão se fornecida
    if (commission !== undefined && commission !== null) {
      if (commission < 0 || commission > 100) {
        return NextResponse.json(
          { error: "Comissão deve ser entre 0 e 100" },
          { status: 400 }
        );
      }
    }

    // Verificar se o vendedor existe no Firestore
    const sellerDoc = await adminDB.collection("users").doc(sellerId).get();
    if (!sellerDoc.exists) {
      return NextResponse.json(
        { error: "Vendedor não encontrado" },
        { status: 404 }
      );
    }

    // Obter o usuário do Auth
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(oldEmail || email);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        return NextResponse.json(
          { error: "Usuário não encontrado no Auth" },
          { status: 404 }
        );
      }
      throw error;
    }

    // Atualizar email no Auth se mudou
    if (oldEmail && oldEmail !== email) {
      try {
        // Verificar se o novo email já existe
        try {
          const existingUser = await adminAuth.getUserByEmail(email);
          if (existingUser.uid !== userRecord.uid) {
            return NextResponse.json(
              { error: "Este e-mail já está sendo usado por outro usuário" },
              { status: 400 }
            );
          }
        } catch (error: any) {
          // Se o erro for 'auth/user-not-found', significa que o email não existe (ok para atualizar)
          if (error.code !== "auth/user-not-found") {
            throw error;
          }
        }

        await adminAuth.updateUser(userRecord.uid, {
          email: email,
        });
      } catch (error: any) {
        console.error("Erro ao atualizar e-mail no Auth:", error);
        if (error.code === "auth/email-already-exists") {
          return NextResponse.json(
            { error: "Este e-mail já está sendo usado por outro usuário" },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    // Atualizar senha no Auth se fornecida
    if (password && password !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter no mínimo 6 caracteres" },
          { status: 400 }
        );
      }

      try {
        await adminAuth.updateUser(userRecord.uid, {
          password: password,
        });
      } catch (error: any) {
        console.error("Erro ao atualizar senha no Auth:", error);
        if (error.code === "auth/weak-password") {
          return NextResponse.json(
            { error: "A senha é muito fraca" },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    // Atualizar displayName no Auth
    await adminAuth.updateUser(userRecord.uid, {
      displayName: fullName,
    });

    // Atualizar dados no Firestore
    const updateData: any = {
      fullName,
      email,
      phone: phone.replace(/\D/g, ""), // Remove máscara
      updatedAt: new Date().toISOString(),
    };

    if (commission !== undefined && commission !== null) {
      updateData.commission = commission;
    }

    await adminDB.collection("users").doc(sellerId).update(updateData);

    return NextResponse.json(
      { message: "Vendedor atualizado com sucesso" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao atualizar vendedor:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar vendedor", details: error.message },
      { status: 500 }
    );
  }
}

