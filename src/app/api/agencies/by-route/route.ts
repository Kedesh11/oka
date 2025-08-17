import { NextRequest } from "next/server";
export const runtime = 'nodejs';
import { z } from "zod";
import { agencyService } from "@/server/services/agencyService";

const querySchema = z.object({
  depart: z.string().min(2),
  arrivee: z.string().min(2),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      depart: searchParams.get("depart") || "",
      arrivee: searchParams.get("arrivee") || "",
    });
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "INVALID_QUERY", details: parsed.error.flatten() }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const { depart, arrivee } = parsed.data;
    const agencies = await agencyService.findAgenciesByRoute({ depart, arrivee });

    return new Response(
      JSON.stringify({
        depart,
        arrivee,
        count: agencies.length,
        agencies: agencies.map((a) => ({
          id: a.id,
          name: a.name,
          phone: a.phone,
          address: a.address,
          trajets: a.trajets?.map((t) => ({ id: t.id, depart: t.depart, arrivee: t.arrivee, heure: t.heure, prixAdulte: t.prixAdulte, prixEnfant: t.prixEnfant })) || [],
        })),
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    console.error("/api/agencies/by-route", err);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
