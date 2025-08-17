import { NextRequest, NextResponse } from "next/server";
import { agencyService } from "@/server/services/agencyService";
import { CreateAgencySchema } from "@/features/agencies/schemas";

export async function GET(request: NextRequest) {
  try {
    const agencies = await agencyService.getAll();
    return NextResponse.json(agencies);
  } catch (error) {
    console.error("[GET /api/admin/agencies]", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // In development, send a more detailed error back to the client.
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ error: "Failed to fetch agencies", details: errorMessage }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to fetch agencies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received body:", body);
    
    const parsed = CreateAgencySchema.safeParse(body);

    if (!parsed.success) {
      console.log("Validation error:", parsed.error.flatten());
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const agency = await agencyService.create(parsed.data);
    return NextResponse.json(agency, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/agencies]", error);
    if (error instanceof Error && error.message === "AGENCY_NAME_EXISTS") {
      return NextResponse.json({ error: "An agency with this name already exists" }, { status: 409 });
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ error: "Failed to create agency", details: errorMessage }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to create agency" }, { status: 500 });
  }
}
