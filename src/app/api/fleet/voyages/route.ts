import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { getRequesterFromHeaders } from '@/server/auth/requester';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const isGlobal = req.role === 'Admin' || req.agenceId === null;
    const voyages = await prisma.voyage.findMany({
      where: isGlobal ? {} : { trajet: { agenceId: req.agenceId ?? undefined } },
      orderBy: { date: 'desc' },
      include: { trajet: true, bus: true },
    });

    return NextResponse.json({ items: voyages });
  } catch (error) {
    console.error('Erreur lors de la récupération des voyages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des voyages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const reqr = await getRequesterFromHeaders(request.headers);
    const body = await request.json();
    const { trajetId, busId, date } = body;

    if (!trajetId || !busId || !date) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Check if trajet and bus exist
    const trajet = await prisma.trajet.findUnique({ where: { id: trajetId } });
    const bus = await prisma.bus.findUnique({ where: { id: busId } });

    if (!trajet) {
      return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 });
    }
    if (!bus) {
      return NextResponse.json({ error: 'Bus non trouvé' }, { status: 404 });
    }

    // Enforce access: non-admins must create within their own agency and matching entities
    if (reqr.role !== 'Admin') {
      if (!reqr.agenceId) return NextResponse.json({ error: 'Droits insuffisants' }, { status: 403 });
      if (trajet.agenceId !== reqr.agenceId) return NextResponse.json({ error: 'Trajet hors agence' }, { status: 403 });
      if (bus.agenceId !== reqr.agenceId) return NextResponse.json({ error: 'Bus hors agence' }, { status: 403 });
    }

    const newVoyage = await prisma.voyage.create({
      data: {
        trajetId,
        busId,
        date: new Date(date),
      },
    });

    return NextResponse.json({ voyage: newVoyage }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du voyage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du voyage' },
      { status: 500 }
    );
  }
}
