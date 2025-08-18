import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { planSeatsWithLLM } from "@/server/ai/seatPlanner";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const voyageId = Number(params.id);
    if (!Number.isFinite(voyageId)) {
      return NextResponse.json({ error: "ID de voyage invalide" }, { status: 400 });
    }

    const voyage = await prisma.voyage.findUnique({
      where: { id: voyageId },
      include: {
        bus: { include: { seats: true } },
        reservations: { include: { passengers: true } },
        assignments: true,
      },
    });

    if (!voyage) return NextResponse.json({ error: "Voyage non trouvé" }, { status: 404 });

    const takenSeatIds = new Set(voyage.assignments.map(a => a.busSeatId));
    const passengers = voyage.reservations.flatMap(r => r.passengers);

    const input = {
      voyageId,
      seats: voyage.bus.seats.map(s => ({
        id: s.id,
        label: s.label,
        row: s.row,
        col: s.col,
        section: s.section ?? undefined,
        isWindow: s.isWindow,
        isAisle: s.isAisle,
      })),
      takenSeatIds: Array.from(takenSeatIds),
      passengers: passengers.map(p => ({
        id: p.id,
        prefWindow: p.prefWindow ?? undefined,
        prefAisle: p.prefAisle ?? undefined,
        prefSection: p.prefSection ?? undefined,
      })),
    } as const;

    const proposals = await planSeatsWithLLM(input);

    return NextResponse.json({
      proposals,
      meta: {
        availableSeats: voyage.bus.seats.length - voyage.assignments.length,
        totalPassengers: passengers.length,
        alreadyAssigned: voyage.assignments.length,
      },
    });
  } catch (e: any) {
    console.error("Erreur IA preview:", e);
    return NextResponse.json({ error: e.message || "Erreur IA" }, { status: 500 });
  }
}
