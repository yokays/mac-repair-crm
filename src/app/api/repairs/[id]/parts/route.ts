import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const repair = await prisma.repair.findUnique({ where: { id } });
    if (!repair) {
      return NextResponse.json(
        { error: "Réparation introuvable" },
        { status: 404 }
      );
    }

    const parts = await prisma.repairPart.findMany({
      where: { repairId: id },
      include: {
        part: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(parts);
  } catch (error) {
    console.error("List repair parts error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

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
    const { partId, quantity, unitPrice } = await request.json();

    if (!partId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "L'ID de la pièce et la quantité sont requis" },
        { status: 400 }
      );
    }

    const repair = await prisma.repair.findUnique({ where: { id } });
    if (!repair) {
      return NextResponse.json(
        { error: "Réparation introuvable" },
        { status: 404 }
      );
    }

    const part = await prisma.part.findUnique({ where: { id: partId } });
    if (!part) {
      return NextResponse.json(
        { error: "Pièce introuvable" },
        { status: 404 }
      );
    }

    if (part.quantity < quantity) {
      return NextResponse.json(
        { error: "Stock insuffisant pour cette pièce" },
        { status: 400 }
      );
    }

    const [repairPart] = await prisma.$transaction([
      prisma.repairPart.create({
        data: {
          repairId: id,
          partId,
          quantity,
          unitPrice: unitPrice !== undefined ? unitPrice : part.sellPrice,
        },
        include: {
          part: true,
        },
      }),
      prisma.stockMovement.create({
        data: {
          partId,
          type: "OUT",
          quantity,
          reason: `Utilisée pour réparation ${repair.token}`,
          repairId: id,
        },
      }),
      prisma.part.update({
        where: { id: partId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      }),
    ]);

    return NextResponse.json(repairPart, { status: 201 });
  } catch (error) {
    console.error("Add repair part error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
