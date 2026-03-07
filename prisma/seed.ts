import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Clean existing data ──────────────────────────────────────
  await prisma.repairPart.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.repairNote.deleteMany();
  await prisma.statusChange.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.part.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────────
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedTech = await bcrypt.hash("tech123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@macrepair.fr",
      password: hashedAdmin,
      firstName: "Admin",
      lastName: "Principal",
      role: "SUPER_ADMIN",
    },
  });

  const tech1 = await prisma.user.create({
    data: {
      email: "tech1@macrepair.fr",
      password: hashedTech,
      firstName: "Lucas",
      lastName: "Martin",
      role: "TECHNICIAN",
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      email: "tech2@macrepair.fr",
      password: hashedTech,
      firstName: "Emma",
      lastName: "Dubois",
      role: "TECHNICIAN",
    },
  });

  console.log("  Users created:", admin.email, tech1.email, tech2.email);

  // ─── Parts ────────────────────────────────────────────────────
  const partsData = [
    {
      name: "Ecran Retina MacBook Pro 13\" A2338",
      sku: "SCR-MBP13-A2338",
      category: "Ecran",
      compatibility: "MacBook Pro 13\"",
      quantity: 8,
      alertThreshold: 3,
      purchasePrice: 180,
      sellPrice: 320,
    },
    {
      name: "Ecran Retina MacBook Air M2",
      sku: "SCR-MBA-M2",
      category: "Ecran",
      compatibility: "MacBook Air",
      quantity: 5,
      alertThreshold: 2,
      purchasePrice: 160,
      sellPrice: 290,
    },
    {
      name: "Batterie MacBook Pro 14\" A2519",
      sku: "BAT-MBP14-A2519",
      category: "Batterie",
      compatibility: "MacBook Pro 14\"",
      quantity: 12,
      alertThreshold: 4,
      purchasePrice: 65,
      sellPrice: 129,
    },
    {
      name: "Batterie MacBook Air A2389",
      sku: "BAT-MBA-A2389",
      category: "Batterie",
      compatibility: "MacBook Air",
      quantity: 15,
      alertThreshold: 5,
      purchasePrice: 50,
      sellPrice: 99,
    },
    {
      name: "Clavier AZERTY MacBook Pro 16\" A2485",
      sku: "KB-MBP16-A2485",
      category: "Clavier",
      compatibility: "MacBook Pro 16\"",
      quantity: 6,
      alertThreshold: 3,
      purchasePrice: 90,
      sellPrice: 189,
    },
    {
      name: "SSD NVMe 512Go Apple",
      sku: "SSD-NVME-512",
      category: "SSD",
      compatibility: "MacBook Air,MacBook Pro 13\",MacBook Pro 14\",MacBook Pro 16\"",
      quantity: 10,
      alertThreshold: 4,
      purchasePrice: 85,
      sellPrice: 179,
    },
    {
      name: "SSD NVMe 1To Apple",
      sku: "SSD-NVME-1TB",
      category: "SSD",
      compatibility: "MacBook Air,MacBook Pro 13\",MacBook Pro 14\",MacBook Pro 16\"",
      quantity: 7,
      alertThreshold: 3,
      purchasePrice: 140,
      sellPrice: 299,
    },
    {
      name: "Trackpad Force Touch MacBook Pro 13\"",
      sku: "TP-MBP13-FT",
      category: "Trackpad",
      compatibility: "MacBook Pro 13\"",
      quantity: 4,
      alertThreshold: 2,
      purchasePrice: 55,
      sellPrice: 119,
    },
    {
      name: "Cable nappe ecran MacBook Air",
      sku: "CBL-MBA-DISP",
      category: "Cable",
      compatibility: "MacBook Air",
      quantity: 20,
      alertThreshold: 5,
      purchasePrice: 12,
      sellPrice: 35,
    },
    {
      name: "Kit visserie complet MacBook Pro",
      sku: "VIS-MBP-KIT",
      category: "Visserie",
      compatibility: "MacBook Pro 13\",MacBook Pro 14\",MacBook Pro 16\"",
      quantity: 25,
      alertThreshold: 8,
      purchasePrice: 5,
      sellPrice: 15,
    },
  ];

  const parts = await Promise.all(
    partsData.map((p) => prisma.part.create({ data: p }))
  );

  console.log("  Parts created:", parts.length);

  // ─── Stock movements (initial stock IN) ───────────────────────
  for (const part of parts) {
    await prisma.stockMovement.create({
      data: {
        partId: part.id,
        type: "IN",
        quantity: part.quantity,
        reason: "Stock initial",
      },
    });
  }

  console.log("  Stock movements created:", parts.length);

  // ─── Repairs ──────────────────────────────────────────────────

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  // Repair 1: POSTAL, status REPAIRING (in progress)
  const repair1 = await prisma.repair.create({
    data: {
      clientFirstName: "Marie",
      clientLastName: "Lefevre",
      clientEmail: "marie.lefevre@gmail.com",
      clientPhone: "06 12 34 56 78",
      clientAddress: "12 rue de la Paix",
      clientCity: "Paris",
      clientPostalCode: "75002",
      macModel: "MacBook Pro 14\"",
      serialNumber: "C02G72EXAMPLE",
      faultType: "Ecran / dalle LCD",
      faultDescription: "Ecran fissure dans le coin inferieur droit apres une chute legere. Taches noires visibles.",
      repairType: "POSTAL",
      status: "REPAIRING",
      priority: "HIGH",
      inboundTracking: "6A12345678901",
      carrier: "Colissimo",
      estimatedCost: 350,
      estimatedReturn: daysFromNow(5),
      technicianId: tech1.id,
      createdAt: daysAgo(7),
      updatedAt: now,
    },
  });

  // Status changes for repair1
  await prisma.statusChange.createMany({
    data: [
      {
        repairId: repair1.id,
        userId: admin.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        createdAt: daysAgo(7),
      },
      {
        repairId: repair1.id,
        userId: tech1.id,
        fromStatus: "PENDING",
        toStatus: "RECEIVED",
        createdAt: daysAgo(5),
      },
      {
        repairId: repair1.id,
        userId: tech1.id,
        fromStatus: "RECEIVED",
        toStatus: "REPAIRING",
        createdAt: daysAgo(3),
      },
    ],
  });

  // Notes for repair1
  await prisma.repairNote.createMany({
    data: [
      {
        repairId: repair1.id,
        userId: tech1.id,
        content: "Colis recu en bon etat. Emballage correct, le Mac est protege.",
        isInternal: false,
        createdAt: daysAgo(5),
      },
      {
        repairId: repair1.id,
        userId: tech1.id,
        content: "Diagnostic termine: dalle LCD fissuree, remplacement necessaire. Piece en stock.",
        isInternal: false,
        createdAt: daysAgo(3),
      },
      {
        repairId: repair1.id,
        userId: tech1.id,
        content: "Attention: legere bosse sur le chassis en aluminium. Photos prises avant intervention.",
        isInternal: true,
        createdAt: daysAgo(3),
      },
    ],
  });

  // Parts used for repair1
  await prisma.repairPart.create({
    data: {
      repairId: repair1.id,
      partId: parts[0].id, // Ecran MBP 13" (closest match)
      quantity: 1,
      unitPrice: 320,
    },
  });

  // Repair 2: LOCAL, status DONE
  const repair2 = await prisma.repair.create({
    data: {
      clientFirstName: "Pierre",
      clientLastName: "Durand",
      clientEmail: "p.durand@outlook.fr",
      clientPhone: "07 98 76 54 32",
      clientAddress: "",
      clientCity: "Lyon",
      clientPostalCode: "69003",
      macModel: "MacBook Air",
      serialNumber: "FVFGH2EXAMPLE",
      faultType: "Batterie",
      faultDescription: "La batterie ne tient plus que 2h. Cycles de charge > 1000.",
      repairType: "LOCAL",
      status: "DONE",
      priority: "NORMAL",
      estimatedCost: 120,
      finalCost: 99,
      estimatedReturn: daysFromNow(1),
      technicianId: tech2.id,
      createdAt: daysAgo(4),
      updatedAt: now,
    },
  });

  await prisma.statusChange.createMany({
    data: [
      {
        repairId: repair2.id,
        userId: admin.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        createdAt: daysAgo(4),
      },
      {
        repairId: repair2.id,
        userId: tech2.id,
        fromStatus: "PENDING",
        toStatus: "RECEIVED",
        createdAt: daysAgo(3),
      },
      {
        repairId: repair2.id,
        userId: tech2.id,
        fromStatus: "RECEIVED",
        toStatus: "REPAIRING",
        createdAt: daysAgo(2),
      },
      {
        repairId: repair2.id,
        userId: tech2.id,
        fromStatus: "REPAIRING",
        toStatus: "DONE",
        createdAt: daysAgo(0.5),
      },
    ],
  });

  await prisma.repairNote.createMany({
    data: [
      {
        repairId: repair2.id,
        userId: tech2.id,
        content: "Batterie remplacee avec succes. Calibrage en cours, on attend un cycle complet.",
        isInternal: false,
        createdAt: daysAgo(1),
      },
      {
        repairId: repair2.id,
        userId: tech2.id,
        content: "Reparation terminee. Le Mac est pret a etre recupere.",
        isInternal: false,
        createdAt: daysAgo(0.5),
      },
    ],
  });

  await prisma.repairPart.create({
    data: {
      repairId: repair2.id,
      partId: parts[3].id, // Batterie MBA
      quantity: 1,
      unitPrice: 99,
    },
  });

  // Repair 3: POSTAL, status SHIPPED
  const repair3 = await prisma.repair.create({
    data: {
      clientFirstName: "Sophie",
      clientLastName: "Bernard",
      clientEmail: "sophie.b@free.fr",
      clientPhone: "06 55 44 33 22",
      clientAddress: "45 avenue Victor Hugo",
      clientCity: "Bordeaux",
      clientPostalCode: "33000",
      macModel: "MacBook Pro 16\"",
      serialNumber: "C02L14EXAMPLE",
      faultType: "Clavier",
      faultDescription: "Plusieurs touches ne repondent plus (E, R, T). Probablement un probleme de nappe.",
      repairType: "POSTAL",
      status: "SHIPPED",
      priority: "NORMAL",
      inboundTracking: "6A98765432109",
      outboundTracking: "6A11223344556",
      carrier: "Chronopost",
      estimatedCost: 220,
      finalCost: 189,
      estimatedReturn: daysFromNow(2),
      technicianId: tech1.id,
      createdAt: daysAgo(12),
      updatedAt: now,
    },
  });

  await prisma.statusChange.createMany({
    data: [
      {
        repairId: repair3.id,
        userId: admin.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        createdAt: daysAgo(12),
      },
      {
        repairId: repair3.id,
        userId: tech1.id,
        fromStatus: "PENDING",
        toStatus: "RECEIVED",
        createdAt: daysAgo(10),
      },
      {
        repairId: repair3.id,
        userId: tech1.id,
        fromStatus: "RECEIVED",
        toStatus: "REPAIRING",
        createdAt: daysAgo(8),
      },
      {
        repairId: repair3.id,
        userId: tech1.id,
        fromStatus: "REPAIRING",
        toStatus: "DONE",
        createdAt: daysAgo(4),
      },
      {
        repairId: repair3.id,
        userId: admin.id,
        fromStatus: "DONE",
        toStatus: "SHIPPED",
        createdAt: daysAgo(2),
      },
    ],
  });

  await prisma.repairNote.create({
    data: {
      repairId: repair3.id,
      userId: tech1.id,
      content: "Clavier complet remplace. Toutes les touches fonctionnent parfaitement. Mac reexpedie via Chronopost.",
      isInternal: false,
      createdAt: daysAgo(2),
    },
  });

  await prisma.repairPart.create({
    data: {
      repairId: repair3.id,
      partId: parts[4].id, // Clavier MBP 16"
      quantity: 1,
      unitPrice: 189,
    },
  });

  // Repair 4: LOCAL, status PENDING (just received)
  const repair4 = await prisma.repair.create({
    data: {
      clientFirstName: "Thomas",
      clientLastName: "Moreau",
      clientEmail: "t.moreau@gmail.com",
      clientPhone: "07 11 22 33 44",
      clientAddress: "",
      clientCity: "Marseille",
      clientPostalCode: "13001",
      macModel: "iMac",
      serialNumber: "D25LN3EXAMPLE",
      faultType: "SSD / stockage",
      faultDescription: "iMac ne demarre plus. Bruits de clic au demarrage, ecran reste noir.",
      repairType: "LOCAL",
      status: "PENDING",
      priority: "URGENT",
      estimatedCost: 300,
      estimatedReturn: daysFromNow(7),
      technicianId: tech2.id,
      createdAt: daysAgo(1),
      updatedAt: now,
    },
  });

  await prisma.statusChange.create({
    data: {
      repairId: repair4.id,
      userId: admin.id,
      fromStatus: "PENDING",
      toStatus: "PENDING",
      createdAt: daysAgo(1),
    },
  });

  // Repair 5: POSTAL, status CLOSED
  const repair5 = await prisma.repair.create({
    data: {
      clientFirstName: "Camille",
      clientLastName: "Roux",
      clientEmail: "camille.roux@yahoo.fr",
      clientPhone: "06 77 88 99 00",
      clientAddress: "8 boulevard Haussmann",
      clientCity: "Paris",
      clientPostalCode: "75009",
      macModel: "MacBook Pro 13\"",
      serialNumber: "C02T99EXAMPLE",
      faultType: "Degat des eaux",
      faultDescription: "Cafe renverse sur le clavier. Quelques touches collent, le trackpad ne repond plus.",
      repairType: "POSTAL",
      status: "CLOSED",
      priority: "HIGH",
      inboundTracking: "6A55667788990",
      outboundTracking: "6A99887766554",
      carrier: "Colissimo",
      estimatedCost: 400,
      finalCost: 450,
      estimatedReturn: daysAgo(2),
      technicianId: tech1.id,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
      closedAt: daysAgo(1),
    },
  });

  await prisma.statusChange.createMany({
    data: [
      {
        repairId: repair5.id,
        userId: admin.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        createdAt: daysAgo(20),
      },
      {
        repairId: repair5.id,
        userId: tech1.id,
        fromStatus: "PENDING",
        toStatus: "RECEIVED",
        createdAt: daysAgo(18),
      },
      {
        repairId: repair5.id,
        userId: tech1.id,
        fromStatus: "RECEIVED",
        toStatus: "REPAIRING",
        createdAt: daysAgo(16),
      },
      {
        repairId: repair5.id,
        userId: tech1.id,
        fromStatus: "REPAIRING",
        toStatus: "DONE",
        createdAt: daysAgo(8),
      },
      {
        repairId: repair5.id,
        userId: admin.id,
        fromStatus: "DONE",
        toStatus: "SHIPPED",
        createdAt: daysAgo(5),
      },
      {
        repairId: repair5.id,
        userId: admin.id,
        fromStatus: "SHIPPED",
        toStatus: "CLOSED",
        createdAt: daysAgo(1),
      },
    ],
  });

  await prisma.repairNote.createMany({
    data: [
      {
        repairId: repair5.id,
        userId: tech1.id,
        content: "Degat des eaux confirme. Corrosion visible sur la carte mere et le trackpad. Nettoyage ultrasonique en cours.",
        isInternal: false,
        createdAt: daysAgo(16),
      },
      {
        repairId: repair5.id,
        userId: tech1.id,
        content: "Client prevenu du surcout: trackpad a remplacer en plus du clavier. Accord recu par email.",
        isInternal: true,
        createdAt: daysAgo(14),
      },
      {
        repairId: repair5.id,
        userId: tech1.id,
        content: "Reparation terminee. Clavier et trackpad remplaces. Tous les tests passent avec succes.",
        isInternal: false,
        createdAt: daysAgo(8),
      },
    ],
  });

  await prisma.repairPart.createMany({
    data: [
      {
        repairId: repair5.id,
        partId: parts[4].id, // Clavier (using MBP16 as closest)
        quantity: 1,
        unitPrice: 189,
      },
      {
        repairId: repair5.id,
        partId: parts[7].id, // Trackpad
        quantity: 1,
        unitPrice: 119,
      },
      {
        repairId: repair5.id,
        partId: parts[9].id, // Kit visserie
        quantity: 1,
        unitPrice: 15,
      },
    ],
  });

  // Additional stock movements (OUT for used parts)
  const outMovements = [
    { partId: parts[0].id, quantity: 1, reason: "Reparation ecran", repairId: repair1.id },
    { partId: parts[3].id, quantity: 1, reason: "Remplacement batterie", repairId: repair2.id },
    { partId: parts[4].id, quantity: 2, reason: "Remplacement clavier (2 reparations)", repairId: repair3.id },
    { partId: parts[7].id, quantity: 1, reason: "Remplacement trackpad", repairId: repair5.id },
    { partId: parts[9].id, quantity: 1, reason: "Visserie reparation", repairId: repair5.id },
  ];

  for (const mv of outMovements) {
    await prisma.stockMovement.create({
      data: {
        partId: mv.partId,
        type: "OUT",
        quantity: mv.quantity,
        reason: mv.reason,
        repairId: mv.repairId,
      },
    });
  }

  console.log("  Repairs created: 5");
  console.log("  Stock movements (OUT) created:", outMovements.length);

  console.log("\nSeed complete!");
  console.log("\n--- Login credentials ---");
  console.log("Admin:  admin@macrepair.fr / admin123");
  console.log("Tech 1: tech1@macrepair.fr / tech123");
  console.log("Tech 2: tech2@macrepair.fr / tech123");
  console.log("\n--- Tracking tokens ---");
  console.log(`Repair 1 (REPAIRING): /suivi/${repair1.token}`);
  console.log(`Repair 2 (DONE):      /suivi/${repair2.token}`);
  console.log(`Repair 3 (SHIPPED):   /suivi/${repair3.token}`);
  console.log(`Repair 4 (PENDING):   /suivi/${repair4.token}`);
  console.log(`Repair 5 (CLOSED):    /suivi/${repair5.token}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
