import { NextRequest, NextResponse } from "next/server";
import { seatingService } from "@/server/services/seatingService";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const voyageId = Number(params.id);
    const res = await seatingService.autoAssign({ voyageId });
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
