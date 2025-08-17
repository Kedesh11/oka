import { NextResponse } from "next/server";
import { voyageRepo } from "@/server/repositories/voyageRepo";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const voyage = await voyageRepo.getById(id);
    return NextResponse.json({ voyage });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
