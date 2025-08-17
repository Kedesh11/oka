import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voyageId = parseInt(params.id);

    if (isNaN(voyageId)) {
      return NextResponse.json({ error: 'ID de voyage invalide' }, { status: 400 });
    }

    const voyage = await prisma.voyage.findUnique({
      where: { id: voyageId },
      include: {
        bus: {
          select: {
            seatCount: true,
          },
        },
        reservations: {
          select: {
            nbVoyageurs: true,
          },
        },
      },
    });

    if (!voyage) {
      return NextResponse.json({ error: 'Voyage non trouvé' }, { status: 404 });
    }

    const totalSeats = voyage.bus.seatCount;
    const takenSeats = voyage.reservations.reduce((sum: number, res: { nbVoyageurs: number }) => sum + res.nbVoyageurs, 0);
    const freeSeats = totalSeats - takenSeats;
    const percentOccupied = totalSeats > 0 ? takenSeats / totalSeats : 0;

    return NextResponse.json({
      totalSeats,
      taken: takenSeats,
      free: freeSeats,
      percent: percentOccupied,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'occupation du voyage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'occupation du voyage' },
      { status: 500 }
    );
  }
}
