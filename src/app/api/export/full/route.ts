import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Fetch all data in parallel
    const [repairs, users, parts, stockMovements] = await Promise.all([
      prisma.repair.findMany({
        include: {
          technician: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          notes: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          statusChanges: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          partsUsed: {
            include: { part: true },
            orderBy: { createdAt: "desc" },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.part.findMany({
        include: {
          movements: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockMovement.findMany({
        include: { part: { select: { name: true, sku: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: `${user.firstName} ${user.lastName}`,
      summary: {
        totalRepairs: repairs.length,
        totalUsers: users.length,
        totalParts: parts.length,
        totalStockMovements: stockMovements.length,
      },
      repairs,
      users,
      parts,
      stockMovements,
    };

    const json = JSON.stringify(exportData, null, 2);
    const date = new Date().toISOString().split("T")[0];

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="mac-place-backup_${date}.json"`,
      },
    });
  } catch (error) {
    console.error("Full export error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
