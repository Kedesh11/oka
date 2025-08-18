import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { generateTempPassword, hashPassword } from "@/server/auth/password";
import { sendMail } from "@/server/email/mailer";

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
    const { searchParams } = new URL(req.url);
    const agenceIdParam = searchParams.get("agenceId");
    if (!agenceIdParam) {
      return NextResponse.json({ error: "Paramètre agenceId requis" }, { status: 400 });
    }
    const agenceId = Number(agenceIdParam);
    if (!Number.isFinite(agenceId)) {
      return NextResponse.json({ error: "agenceId invalide" }, { status: 400 });
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
    const requesterEmail = req.headers.get("x-user-email") || undefined;
    const requesterRole = (req.headers.get("x-user-role") || "").trim();
    const json = await req.json();
    const parsed = CreateAgentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, agenceId } = parsed.data;

    // Cas 1: Super Admin peut créer un agent global (sans agenceId) ou pour n'importe quelle agence
    const isAdmin = requesterRole === "Admin";
    let agence: { id: number; name: string; email: string | null } | null = null;
    if (!isAdmin) {
      // Non admin: agenceId requis et le demandeur doit être le propriétaire (email agence)
      if (!agenceId) return NextResponse.json({ error: "agenceId requis" }, { status: 400 });
      agence = await prisma.agence.findUnique({ where: { id: agenceId }, select: { id: true, name: true, email: true } });
      if (!agence) return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });
      if (!requesterEmail || !agence.email || requesterEmail.toLowerCase() !== agence.email.toLowerCase()) {
        return NextResponse.json({ error: "Accès refusé (seul l'email propriétaire de l'agence peut créer des agents)" }, { status: 403 });
      }
    } else {
      // Admin: si agenceId fourni, vérifier son existence (facultatif)
      if (agenceId) {
        agence = await prisma.agence.findUnique({ where: { id: agenceId }, select: { id: true, name: true, email: true } });
        if (!agence) return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });
      }
    }

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
        // Si admin et pas d'agenceId => agent global (accès toutes infos)
        agenceId: agenceId ?? null,
      },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    });

    // Envoyer le mail avec le mot de passe temporaire
    const subject = `Votre accès agent au dashboard OKA`;
    const scopeText = agence?.name ? `pour l'agence <b>${agence.name}</b>` : `global (toutes les agences)`;
    const html = `<p>Bonjour ${name},</p>
<p>Votre compte agent ${scopeText} a été créé.</p>
<p>Identifiant: <b>${email}</b><br/>Mot de passe provisoire: <b>${tempPwd}</b></p>
<p>Merci de vous connecter et de modifier votre mot de passe dès votre première connexion.</p>
<p>Cordialement,<br/>OKA Voyages</p>`;

    try {
      await sendMail({ to: email, subject, html });
    } catch (mailErr: any) {
      console.error("Erreur envoi email agent:", mailErr);
      // Le compte est créé malgré tout, on remonte l'info au client
      return NextResponse.json({ user, warning: "Utilisateur créé mais l'email n'a pas pu être envoyé" }, { status: 201 });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/agence/agents error", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
