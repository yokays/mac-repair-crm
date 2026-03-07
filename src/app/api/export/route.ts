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
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    const repairs = await prisma.repair.findMany({
      where,
      include: {
        technician: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // CSV headers
    const headers = [
      "ID",
      "Token",
      "Date de création",
      "Prénom client",
      "Nom client",
      "Email client",
      "Téléphone client",
      "Adresse",
      "Ville",
      "Code postal",
      "Modèle Mac",
      "Numéro de série",
      "Type de panne",
      "Description",
      "Type de réparation",
      "Statut",
      "Priorité",
      "Suivi entrant",
      "Suivi sortant",
      "Transporteur",
      "Coût estimé",
      "Coût final",
      "Technicien",
      "Date de clôture",
    ];

    const escapeCSV = (value: string): string => {
      if (
        value.includes(",") ||
        value.includes('"') ||
        value.includes("\n")
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = repairs.map((repair) => [
      repair.id,
      repair.token,
      repair.createdAt.toISOString(),
      repair.clientFirstName,
      repair.clientLastName,
      repair.clientEmail,
      repair.clientPhone,
      repair.clientAddress,
      repair.clientCity,
      repair.clientPostalCode,
      repair.macModel,
      repair.serialNumber,
      repair.faultType,
      repair.faultDescription,
      repair.repairType,
      repair.status,
      repair.priority,
      repair.inboundTracking,
      repair.outboundTracking,
      repair.carrier,
      repair.estimatedCost.toString(),
      repair.finalCost.toString(),
      repair.technician
        ? `${repair.technician.firstName} ${repair.technician.lastName}`
        : "",
      repair.closedAt ? repair.closedAt.toISOString() : "",
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // BOM for proper UTF-8 encoding in Excel
    const bom = "\uFEFF";

    return new NextResponse(bom + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reparations_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
