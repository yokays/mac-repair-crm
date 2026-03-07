import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const cookie = serialize("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  const response = NextResponse.json({ message: "Déconnexion réussie" });
  response.headers.set("Set-Cookie", cookie);
  return response;
}
