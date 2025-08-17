import { NextRequest, NextResponse } from "next/server";
import { busRepo } from "@/server/repositories/busRepo";

// WARNING: replace with real agenceId from auth/session
const DEFAULT_AGENCE_ID = 1;

export async function GET() {
  try {
    const items = await busRepo.listByAgence(DEFAULT_AGENCE_ID);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bus = await busRepo.create({
      agenceId: DEFAULT_AGENCE_ID,
      name: body.name,
      type: body.type,
      seatCount: Number(body.seatCount ?? 0),
      seatsPerRow: Number(body.seatsPerRow ?? 4),
      layout: body.layout ?? null,
    });
    return NextResponse.json({ bus });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
