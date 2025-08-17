import { NextRequest, NextResponse } from "next/server";
import { busRepo } from "@/server/repositories/busRepo";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const busId = Number(params.id);
    const body = await req.json();
    const seats = (body.seats ?? []) as { label: string; row: number; col: number }[];
    const bus = await busRepo.setSeats(busId, seats);
    return NextResponse.json({ bus });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
