import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

// Helpers d'autorisation
async function canManageAgent(req: NextRequest, agentUserId: number) {
  const requesterEmail = req.headers.get("x-user-email") || undefined;
  const requesterRole = (req.headers.get("x-user-role") || "").trim();

  // Charger l'agent ciblé
  const agent = await prisma.user.findUnique({
    where: { id: agentUserId },
    select: { id: true, email: true, role: true, agenceId: true },
  });
  if (!agent) return { allowed: false, status: 404, error: "Agent introuvable" } as const;

  // Super Admin global
  if (requesterRole === "Admin") return { allowed: true, agent } as const;

  // Propriétaire agence: email du requester doit correspondre à l'email de l'agence liée à l'agent
  if (!agent.agenceId || !requesterEmail) return { allowed: false, status: 403, error: "Accès refusé" } as const;
  const agence = await prisma.agence.findUnique({ where: { id: agent.agenceId }, select: { email: true } });
  if (!agence || !agence.email) return { allowed: false, status: 403, error: "Accès refusé" } as const;
  if (agence.email.toLowerCase() !== requesterEmail.toLowerCase()) {
    return { allowed: false, status: 403, error: "Accès refusé" } as const;
  }
  return { allowed: true, agent } as const;
}

const UpdateAgentSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  role: z.enum(["Admin", "Agence", "Client"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const auth = await canManageAgent(req, id);
    if (!auth.allowed) return NextResponse.json({ error: auth.error }, { status: (auth as any).status ?? 403 });

    const json = await req.json();
    const parsed = UpdateAgentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
    }

    const requesterRole = (req.headers.get("x-user-role") || "").trim();

    // Règles de changement de rôle
    let data = parsed.data as any;
    if (data.email) data.email = data.email.trim().toLowerCase();
    if (data.role) {
      if (requesterRole !== "Admin") {
        // Le propriétaire d'agence ne peut pas élever en Admin ou changer vers Client
        if (data.role !== "Agence") {
          return NextResponse.json({ error: "Vous ne pouvez définir le rôle qu'à 'Agence'" }, { status: 403 });
        }
      }
    }

    // Unicité de l'email si modifié
    if (data.email) {
      const exists = await prisma.user.findFirst({ where: { email: data.email, id: { not: id } } });
      if (exists) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, status: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e: any) {
    console.error("PATCH /api/agence/agents/[id] error", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const auth = await canManageAgent(req, id);
    if (!auth.allowed) return NextResponse.json({ error: auth.error }, { status: (auth as any).status ?? 403 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/agence/agents/[id] error", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
