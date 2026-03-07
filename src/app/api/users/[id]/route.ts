import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

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

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Only SUPER_ADMIN can update other users; technicians can only update themselves
    if (user.id !== id && !requireRole(user.role, "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.email !== undefined) {
      const emailLower = body.email.toLowerCase();
      if (emailLower !== existing.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: emailLower },
        });
        if (emailExists) {
          return NextResponse.json(
            { error: "Un utilisateur avec cet email existe déjà" },
            { status: 409 }
          );
        }
        data.email = emailLower;
      }
    }

    // Only SUPER_ADMIN can change roles and active status
    if (requireRole(user.role, "SUPER_ADMIN")) {
      if (body.role !== undefined) {
        data.role = body.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "TECHNICIAN";
      }
      if (body.active !== undefined) {
        data.active = body.active;
      }
    }

    // Password change
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json(
          { error: "Le mot de passe doit contenir au moins 6 caractères" },
          { status: 400 }
        );
      }
      data.password = await bcrypt.hash(body.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
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

    if (!requireRole(user.role, "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Accès refusé — rôle Super Admin requis" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (id === user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas désactiver votre propre compte" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: { active: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json(deactivatedUser);
  } catch (error) {
    console.error("Deactivate user error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
