import { NextResponse } from "next/server";

export async function POST() {
  const response = new NextResponse(
    JSON.stringify({ message: "Logout successful" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Limpa o cookie authToken
  response.cookies.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });

  // Limpa o cookie role
  response.cookies.set("role", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
