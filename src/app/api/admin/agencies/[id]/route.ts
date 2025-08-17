import { NextRequest, NextResponse } from "next/server";
import { agencyService } from "@/server/services/agencyService";
import { UpdateAgencySchema } from "@/features/agencies/schemas";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid agency ID" }, { status: 400 });
    }

    const agency = await agencyService.getById(id);
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error(`[GET /api/admin/agencies/${params.id}]`, error);
    return NextResponse.json({ error: "Failed to fetch agency" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid agency ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = UpdateAgencySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const updatedAgency = await agencyService.update(id, parsed.data);
    return NextResponse.json(updatedAgency);
  } catch (error) {
    console.error(`[PUT /api/admin/agencies/${params.id}]`, error);
    return NextResponse.json({ error: "Failed to update agency" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid agency ID" }, { status: 400 });
    }

    await agencyService.delete(id);
    return NextResponse.json({ message: "Agency deleted successfully" });
  } catch (error) {
    console.error(`[DELETE /api/admin/agencies/${params.id}]`, error);
    if (error instanceof Error) {
      if (error.message === "AGENCY_NOT_FOUND") {
        return NextResponse.json({ error: "Agency not found" }, { status: 404 });
      }
      if (error.message === "AGENCY_HAS_RELATIONS") {
        return NextResponse.json({ error: "Cannot delete agency with associated data" }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Failed to delete agency" }, { status: 500 });
  }
}
