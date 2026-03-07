import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const { type, quantity, reason } = await request.json();

    if (!type || !["IN", "OUT"].includes(type)) {
      return NextResponse.json(
        { error: "Le type doit être IN ou OUT" },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "La quantité doit être supérieure à 0" },
        { status: 400 }
      );
    }

    const part = await prisma.part.findUnique({ where: { id } });
    if (!part) {
      return NextResponse.json(
        { error: "Pièce introuvable" },
        { status: 404 }
      );
    }

    if (type === "OUT" && part.quantity < quantity) {
      return NextResponse.json(
        { error: "Stock insuffisant" },
        { status: 400 }
      );
    }

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          partId: id,
          type,
          quantity,
          reason: reason || "",
        },
      }),
      prisma.part.update({
        where: { id },
        data: {
          quantity: type === "IN"
            ? { increment: quantity }
            : { decrement: quantity },
        },
      }),
    ]);

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error("Create stock movement error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
