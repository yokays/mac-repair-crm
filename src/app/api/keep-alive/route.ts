import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ping the database every few minutes to prevent Neon cold starts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
