import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
import { agencyService } from "@/server/services/agencyService";
import { Prisma } from "@prisma/client";
import { CreateAgencySchema } from "@/features/agencies/schemas";
import { prisma } from "@/server/db/prisma";
import { generateTempPassword, hashPassword } from "@/server/auth/password";
import { sendMail } from "@/server/email/mailer";
import { accountCreatedTemplate } from "@/server/email/templates";

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

    // Si un email est fourni pour l'agence, créer un propriétaire et envoyer l'email
    let tempPassword: string | undefined;
    if (agency.email) {
      try {
        tempPassword = generateTempPassword();
        const hashed = await hashPassword(tempPassword);
        // Créer le compte propriétaire (rôle Agence)
        await prisma.user.create({
          data: {
            name: agency.name,
            email: agency.email,
            password: hashed,
            role: 'Agence',
            status: 'active',
            agenceId: agency.id,
          },
        });

        // Envoyer l'email avec le template réutilisable
        const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
        const dashboardUrl = `${baseUrl}/dashboard/agence`;
        const { subject, html } = accountCreatedTemplate({
          agencyName: agency.name,
          dashboardUrl,
          tempPassword,
        });
        await sendMail({ to: agency.email, subject, html });
      } catch (mailOrUserErr) {
        console.error('[POST /api/admin/agencies] owner creation/email error:', mailOrUserErr);
        // Continuer malgré l'échec d'email; l'agence est créée.
      }
    }

    if (process.env.NODE_ENV === 'development' && tempPassword) {
      return NextResponse.json({ agency, tempPassword }, { status: 201 });
    }
    return NextResponse.json(agency, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/agencies]", error);
    // Prisma unique constraint
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as any) || [];
      const targets = Array.isArray(target) ? target : [target];
      if (targets.includes('email')) {
        return NextResponse.json({ error: "An agency with this email already exists" }, { status: 409 });
      }
      if (targets.includes('name')) {
        return NextResponse.json({ error: "An agency with this name already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: "Unique constraint violation" }, { status: 409 });
    }
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
