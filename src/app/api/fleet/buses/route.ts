import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // TODO: Filter buses by agenceId once authentication is implemented
    const buses = await prisma.bus.findMany({
      orderBy: {
        createdAt: 'desc',
      },
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
    const body = await request.json();
    const { name, type, seatCount, seatsPerRow, layout, agenceId } = body;

    if (!name || !type || !seatCount || !seatsPerRow || agenceId === undefined) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const newBus = await prisma.bus.create({
      data: {
        name,
        type,
        seatCount,
        seatsPerRow,
        layout,
        agenceId,
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
