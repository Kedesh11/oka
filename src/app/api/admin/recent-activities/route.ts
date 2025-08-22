import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/server/db/prisma';

export async function GET() {
  try {
    const recentReservations = await prisma.reservation.findMany({
      where: {
        statut: 'payee',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        trajet: {
          select: { depart: true, arrivee: true }
        },
      },
    });

    const activities = recentReservations.map((r: {
      id: number;
      totalAmount: number;
      createdAt: Date;
      trajet: { depart: string; arrivee: string };
    }) => ({
      id: r.id,
      action: 'Paiement reçu',
      entity: `${r.totalAmount.toLocaleString('fr-FR')} FCFA - ${r.trajet.depart} → ${r.trajet.arrivee}`,
      time: r.createdAt.toISOString(),
      type: 'success',
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Erreur lors de la récupération des activités récentes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des activités récentes' },
      { status: 500 }
    );
  }
}
