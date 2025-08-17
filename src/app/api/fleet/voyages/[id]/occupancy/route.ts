import { NextResponse } from "next/server";
import { voyageRepo } from "@/server/repositories/voyageRepo";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const occ = await voyageRepo.occupancy(id);
    return NextResponse.json({ ...occ });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
