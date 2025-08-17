import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // TODO: Filter voyages by agenceId once authentication is implemented
    const voyages = await prisma.voyage.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        trajet: true,
        bus: true,
      },
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
