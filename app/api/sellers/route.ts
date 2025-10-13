import { NextRequest, NextResponse } from "next/server";
import { adminDB, adminAuth } from "@/lib/firebaseAdmin";

// GET - Buscar vendedores
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    // Busca vendedores com rule 'sub_indicador' e masterUid igual ao userId
    const sellersSnapshot = await adminDB
      .collection("users")
      .where("rule", "==", "sub_indicador")
      .where("masterUid", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const sellers = sellersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ sellers }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar vendedores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendedores", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar vendedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      password,
      affiliated_to,
      unitName,
      profilePicture,
      masterUid,
      commission,
    } = body;

    // Validações básicas
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
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

    // Validar senha (mínimo 6 caracteres conforme padrão Firebase)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Validar comissão se fornecida
    if (commission !== undefined && (commission < 0 || commission > 100)) {
      return NextResponse.json(
        { error: "Comissão deve ser entre 0 e 100" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { error: "Este e-mail já está sendo usado por outro usuário" },
        { status: 400 }
      );
    } catch (error: any) {
      // Se o erro for 'auth/user-not-found', significa que o email não existe (ok para criar)
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Criar usuário no Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
      disabled: false,
    });

    // Criar documento do usuário no Firestore
    const userData = {
      fullName,
      email,
      phone: phone.replace(/\D/g, ""), // Remove máscara
      rule: "sub_indicador",
      affiliated_to: affiliated_to || null,
      unitName: unitName || null,
      profilePicture: profilePicture || null,
      masterUid: masterUid || null,
      commission: commission || null,
      disabled: false,
      createdAt: new Date().toISOString(),
      uid: userRecord.uid,
    };

    await adminDB.collection("users").doc(userRecord.uid).set(userData);

    return NextResponse.json(
      {
        message: "Vendedor criado com sucesso",
        userId: userRecord.uid,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao criar vendedor:", error);

    // Tratamento de erros específicos do Firebase
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Este e-mail já está sendo usado por outro usuário" },
        { status: 400 }
      );
    } else if (error.code === "auth/invalid-email") {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    } else if (error.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "A senha é muito fraca" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar vendedor", details: error.message },
      { status: 500 }
    );
  }
}

