import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { generateTempPassword, hashPassword } from "@/server/auth/password";
import { sendMail } from "@/server/email/mailer";
import { accountCreatedTemplate } from "@/server/email/templates";
import { getRequesterFromHeaders } from "@/server/auth/requester";

export const runtime = "nodejs";

const CreateAgentByAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  agenceId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const requester = await getRequesterFromHeaders(req.headers);
    if (requester.role !== "Admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = CreateAgentByAdminSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, agenceId } = parsed.data;

    const agence = await prisma.agence.findUnique({ where: { id: agenceId }, select: { id: true, name: true } });
    if (!agence) return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 });

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
      console.error("[POST /api/admin/agents] erreur envoi email:", mailErr);
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ user, warning: "Utilisateur créé mais l'email n'a pas pu être envoyé", tempPassword: tempPwd }, { status: 201 });
      }
      return NextResponse.json({ user, warning: "Utilisateur créé mais l'email n'a pas pu être envoyé" }, { status: 201 });
    }

    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ user, tempPassword: tempPwd }, { status: 201 });
    }
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/admin/agents error", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
