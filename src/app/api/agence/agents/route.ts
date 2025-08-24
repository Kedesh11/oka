import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { generateTempPassword, hashPassword } from "@/server/auth/password";
import { sendMail } from "@/server/email/mailer";
import { getRequesterFromHeaders } from "@/server/auth/requester";
import { accountCreatedTemplate } from "@/server/email/templates";

export const runtime = "nodejs";

const CreateAgentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  // agenceId peut être omis si le créateur est Super Admin (agent global)
  agenceId: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const requester = await getRequesterFromHeaders(req.headers);
    // Interdire l'Admin plateforme sur les endpoints du dashboard Agence
    if (requester.role === "Admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const agenceIdParam = searchParams.get("agenceId");
    if (!agenceIdParam) {
      return NextResponse.json({ error: "Paramètre agenceId requis" }, { status: 400 });
    }
    const agenceId = Number(agenceIdParam);
    if (!Number.isFinite(agenceId)) {
      return NextResponse.json({ error: "agenceId invalide" }, { status: 400 });
    }

    // Restreindre la lecture aux agents de la même agence uniquement
    if (!requester.agenceId || requester.agenceId !== agenceId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { agenceId, role: "Agence" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    });

    return NextResponse.json({ items: users });
  } catch (e: any) {
    console.error("GET /api/agence/agents error", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const requester = await getRequesterFromHeaders(req.headers);
    // Interdire l'Admin plateforme et exiger le propriétaire d'agence
    if (requester.role === "Admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (!requester.isAgencyOwner) {
      return NextResponse.json({ error: "Seul le propriétaire de l'agence peut créer des agents" }, { status: 403 });
    }
    const json = await req.json();
    const parsed = CreateAgentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, phone } = parsed.data;
    if (!requester.agenceId) {
      return NextResponse.json({ error: "Agence du requérant inconnue" }, { status: 403 });
    }
    const agenceId = requester.agenceId;
    const agence = await prisma.agence.findUnique({ where: { id: agenceId }, select: { id: true, name: true, email: true } });
    if (!agence) return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });

    // Vérifier si email déjà utilisé
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 });

    // Générer mot de passe temporaire et hasher
    const tempPwd = generateTempPassword();
    const hashed = await hashPassword(tempPwd);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashed,
        role: "Agence",
        status: "active",
        agenceId,
      },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    });

    const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
    const dashboardUrl = `${baseUrl}/dashboard/agence`;
    const { subject, html } = accountCreatedTemplate({
      agencyName: agence.name,
      dashboardUrl,
      tempPassword: tempPwd,
    });

    try {
      await sendMail({ to: email, subject, html });
    } catch (mailErr: any) {
      console.error("Erreur envoi email agent:", mailErr);
      // Le compte est créé malgré tout, on remonte l'info au client
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ user, warning: "Utilisateur créé mais l'email n'a pas pu être envoyé", tempPassword: tempPwd }, { status: 201 });
      }
      return NextResponse.json({ user, warning: "Utilisateur créé mais l'email n'a pas pu être envoyé" }, { status: 201 });
    }

    // En dev, retourner aussi le mot de passe provisoire pour faciliter les tests
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ user, tempPassword: tempPwd }, { status: 201 });
    }
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/agence/agents error", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
