import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { AssignmentListSchema } from "@/server/ai/seatPlanner";
import { getRequesterFromHeaders } from "@/server/auth/requester";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const voyageId = Number(params.id);
    if (!Number.isFinite(voyageId)) {
      return NextResponse.json({ error: "ID de voyage invalide" }, { status: 400 });
    }

    const body = await request.json();
    const validated = AssignmentListSchema.safeParse(body?.proposals ?? body);
    if (!validated.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const proposals = validated.data.filter(a => a.voyageId === voyageId);
    if (proposals.length === 0) {
      return NextResponse.json({ error: "Aucune assignation à appliquer" }, { status: 400 });
    }

    // Charger l'état actuel pour vérifier conflits
    const current = await prisma.voyage.findUnique({
      where: { id: voyageId },
      include: { assignments: true, trajet: { select: { agenceId: true } } },
    });
    if (!current) return NextResponse.json({ error: "Voyage non trouvé" }, { status: 404 });

    // Admin plateforme: lecture seule -> POST interdit
    if (req.role === "Admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (!req.agenceId || current.trajet.agenceId !== req.agenceId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const takenSeats = new Set(current.assignments.map(a => a.busSeatId));
    const takenPassengers = new Set(current.assignments.map(a => a.passengerId));

    const toCreate = proposals.filter(p => !takenSeats.has(p.busSeatId) && !takenPassengers.has(p.passengerId));

    if (toCreate.length === 0) {
      return NextResponse.json({ applied: 0, total: proposals.length, message: "Aucune assignation nouvelle (toutes en conflit)" });
    }

    await prisma.seatAssignment.createMany({
      data: toCreate.map(p => ({ voyageId: p.voyageId, busSeatId: p.busSeatId, passengerId: p.passengerId })),
    });

    return NextResponse.json({ applied: toCreate.length, total: proposals.length });
  } catch (e: any) {
    console.error("Erreur IA apply:", e);
    return NextResponse.json({ error: e.message || "Erreur IA" }, { status: 500 });
  }
}
