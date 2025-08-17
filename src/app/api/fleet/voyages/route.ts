import { NextRequest, NextResponse } from "next/server";
import { voyageRepo } from "@/server/repositories/voyageRepo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const date = new Date(body.date);
    const voyage = await voyageRepo.create({ trajetId: Number(body.trajetId), busId: Number(body.busId), date });
    return NextResponse.json({ voyage });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
