import { NextRequest, NextResponse } from "next/server";
import { reservationService } from "@/server/services/reservationService";
import { StatutReservation } from "@prisma/client";
import { ReservationsQuerySchema, CreateReservationSchema } from "@/features/reservations/schemas";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = ReservationsQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }
    const { trajetId, statut } = parsed.data;

    const reservations = await reservationService.list({ trajetId, statut: statut as StatutReservation | undefined });

    return NextResponse.json(reservations);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateReservationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }
    const created = await reservationService.create(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("[POST /api/reservations]", e);
    const msg = e instanceof Error ? e.message : "Server error";
    const code = (e as any)?.code;
    if (msg === "TRAJET_NOT_FOUND") {
      return NextResponse.json({ error: "TRAJET_NOT_FOUND" }, { status: 400 });
    }
    if (code === "P2003") {
      // Foreign key constraint failed (likely invalid trajetId)
      return NextResponse.json({ error: "FK_CONSTRAINT", details: "Invalid trajetId" }, { status: 400 });
    }
    return NextResponse.json({ error: msg, code }, { status: 500 });
  }
}