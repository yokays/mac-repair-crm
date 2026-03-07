import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { compatibility: { contains: search } },
      ];
    }

    let parts = await prisma.part.findMany({
      where,
      orderBy: { name: "asc" },
    });

    // Filter low stock parts in application layer since Prisma doesn't
    // support comparing two columns directly
    if (lowStock === "true") {
      parts = parts.filter((p) => p.quantity <= p.alertThreshold);
    }

    return NextResponse.json(parts);
  } catch (error) {
    console.error("List parts error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      sku,
      category,
      compatibility,
      quantity,
      alertThreshold,
      purchasePrice,
      sellPrice,
    } = body;

    if (!name || !sku || !category) {
      return NextResponse.json(
        { error: "Le nom, le SKU et la catégorie sont requis" },
        { status: 400 }
      );
    }

    const existingSku = await prisma.part.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json(
        { error: "Ce SKU existe déjà" },
        { status: 409 }
      );
    }

    const part = await prisma.part.create({
      data: {
        name,
        sku,
        category,
        compatibility: compatibility || "",
        quantity: quantity || 0,
        alertThreshold: alertThreshold !== undefined ? alertThreshold : 5,
        purchasePrice: purchasePrice || 0,
        sellPrice: sellPrice || 0,
      },
    });

    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    console.error("Create part error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
