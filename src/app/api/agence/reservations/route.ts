import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // TODO: Filter reservations by agenceId once authentication is implemented
    const reservations = await prisma.reservation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        trajet: true, // Include related trajet details
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, statut } = body;

    if (!id || !statut) {
      return NextResponse.json(
        { error: "L'ID et le statut sont requis" },
        { status: 400 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        statut: statut as any, // Cast to match Prisma enum type
      },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la réservation' },
      { status: 500 }
    );
  }
}

