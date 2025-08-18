import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { getRequesterFromHeaders } from '@/server/auth/requester';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const isGlobal = req.role === 'Admin' || req.agenceId === null;
    const buses = await prisma.bus.findMany({
      where: isGlobal ? {} : { agenceId: req.agenceId ?? undefined },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items: buses });
  } catch (error) {
    console.error('Erreur lors de la récupération des bus:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bus' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const reqr = await getRequesterFromHeaders(request.headers);
    const body = await request.json();
    const { name, type, seatCount, seatsPerRow, layout, agenceId } = body;

    if (!name || !type || !seatCount || !seatsPerRow || agenceId === undefined) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Enforce access
    let finalAgenceId = agenceId as number;
    if (reqr.role !== 'Admin') {
      if (!reqr.agenceId) return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 });
      finalAgenceId = reqr.agenceId;
    }

    // Validate agency exists
    const agency = await prisma.agence.findUnique({ where: { id: finalAgenceId } });
    if (!agency) {
      return NextResponse.json({ error: "L'agence spécifiée n'existe pas" }, { status: 400 });
    }

    const newBus = await prisma.bus.create({
      data: {
        name,
        type,
        seatCount,
        seatsPerRow,
        layout,
        agenceId: finalAgenceId,
      },
    });

    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du bus:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du bus' },
      { status: 500 }
    );
  }
}
