import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { idToken, role } = await req.json();

  if (!idToken || !role) {
    return NextResponse.json(
      { error: "Payload inválido. idToken e role são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    // Verifica se o token é válido
    const decoded = await adminAuth.verifyIdToken(idToken);

    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 dias em ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const res = new NextResponse(
      JSON.stringify({ ok: true, uid: decoded.uid, role }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

    res.cookies.set("authToken", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // strict evita CSRF
      maxAge: expiresIn / 1000,
      path: "/",
    });

    res.cookies.set("role", role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Falha ao validar ID token:", err);
    return NextResponse.json(
      { error: "credenciais inválidas" },
      { status: 401 }
    );
  }
}
