import { NextRequest, NextResponse } from "next/server";
import { trajetService } from "@/server/services/trajetService";
import { TrajetsQuerySchema } from "@/features/trajets/schemas";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = TrajetsQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }
    const { depart, arrivee, statut, agenceId } = parsed.data;

    const trajets = await trajetService.list({ depart, arrivee, statut, agenceId });

    return NextResponse.json(trajets);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}