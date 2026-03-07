import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Active repairs counts
    const [totalActive, postalActive, localActive] = await Promise.all([
      prisma.repair.count({ where: { status: { not: "CLOSED" } } }),
      prisma.repair.count({
        where: { status: { not: "CLOSED" }, repairType: "POSTAL" },
      }),
      prisma.repair.count({
        where: { status: { not: "CLOSED" }, repairType: "LOCAL" },
      }),
    ]);

    // Completed this month
    const completedThisMonth = await prisma.repair.count({
      where: {
        closedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Revenue this month
    const revenueResult = await prisma.repair.aggregate({
      _sum: { finalCost: true },
      where: {
        closedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    const revenueThisMonth = revenueResult._sum.finalCost || 0;

    // Average repair days for closed repairs
    const closedRepairs = await prisma.repair.findMany({
      where: { closedAt: { not: null } },
      select: { createdAt: true, closedAt: true },
    });

    let avgRepairDays = 0;
    if (closedRepairs.length > 0) {
      const totalDays = closedRepairs.reduce((sum, repair) => {
        const diffMs = repair.closedAt!.getTime() - repair.createdAt.getTime();
        return sum + diffMs / (1000 * 60 * 60 * 24);
      }, 0);
      avgRepairDays = Math.round((totalDays / closedRepairs.length) * 10) / 10;
    }

    // Repairs by fault type
    const repairsByFaultRaw = await prisma.repair.groupBy({
      by: ["faultType"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
    const repairsByFault = repairsByFaultRaw.map((r) => ({
      faultType: r.faultType,
      count: r._count.id,
    }));

    // Repairs by month (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const allRepairsForMonths = await prisma.repair.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    });

    const repairsByMonth: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      const count = allRepairsForMonths.filter((r) => {
        return (
          r.createdAt.getFullYear() === year &&
          r.createdAt.getMonth() === month
        );
      }).length;
      repairsByMonth.push({ month: key, count });
    }

    // Repairs by type
    const repairsByTypeRaw = await prisma.repair.groupBy({
      by: ["repairType"],
      _count: { id: true },
    });
    const repairsByType = repairsByTypeRaw.map((r) => ({
      type: r.repairType,
      count: r._count.id,
    }));

    // Top Mac models
    const topModelsRaw = await prisma.repair.groupBy({
      by: ["macModel"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });
    const topModels = topModelsRaw.map((r) => ({
      model: r.macModel,
      count: r._count.id,
    }));

    // Stock alerts
    const allParts = await prisma.part.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        quantity: true,
        alertThreshold: true,
      },
    });
    const stockAlerts = allParts.filter((p) => p.quantity <= p.alertThreshold);

    // Total stock value
    const allPartsForValue = await prisma.part.findMany({
      select: { quantity: true, purchasePrice: true },
    });
    const totalStockValue = allPartsForValue.reduce(
      (sum, p) => sum + p.quantity * p.purchasePrice,
      0
    );

    return NextResponse.json({
      totalActive,
      postalActive,
      localActive,
      completedThisMonth,
      revenueThisMonth,
      avgRepairDays,
      repairsByFault,
      repairsByMonth,
      repairsByType,
      topModels,
      stockAlerts,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
