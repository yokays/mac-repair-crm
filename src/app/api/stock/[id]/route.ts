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

    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!part) {
      return NextResponse.json(
        { error: "Pièce introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(part);
  } catch (error) {
    console.error("Get part error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Pièce introuvable" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    const allowedFields = [
      "name",
      "sku",
      "category",
      "compatibility",
      "quantity",
      "alertThreshold",
      "purchasePrice",
      "sellPrice",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // If SKU is being changed, check uniqueness
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await prisma.part.findUnique({
        where: { sku: data.sku },
      });
      if (skuExists) {
        return NextResponse.json(
          { error: "Ce SKU existe déjà" },
          { status: 409 }
        );
      }
    }

    const part = await prisma.part.update({
      where: { id },
      data,
    });

    return NextResponse.json(part);
  } catch (error) {
    console.error("Update part error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Pièce introuvable" },
        { status: 404 }
      );
    }

    await prisma.part.delete({ where: { id } });

    return NextResponse.json({ message: "Pièce supprimée" });
  } catch (error) {
    console.error("Delete part error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
