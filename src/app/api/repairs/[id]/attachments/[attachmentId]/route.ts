import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { deleteFile } from "@/lib/attachments";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { id, attachmentId } = await params;

    const attachment = await prisma.repairAttachment.findFirst({
      where: { id: attachmentId, repairId: id },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    // Redirect to Vercel Blob URL
    return NextResponse.redirect(attachment.url);
  } catch (error) {
    console.error("Serve attachment error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { id, attachmentId } = await params;

    const attachment = await prisma.repairAttachment.findFirst({
      where: { id: attachmentId, repairId: id },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    if (attachment.url) {
      await deleteFile(attachment.url);
    }
    await prisma.repairAttachment.delete({ where: { id: attachmentId } });

    return NextResponse.json({ message: "Fichier supprime" });
  } catch (error) {
    console.error("Delete attachment error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
