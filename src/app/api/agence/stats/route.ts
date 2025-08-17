import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalTrajets = await prisma.trajet.count();
    const activeTrajets = await prisma.trajet.count({
      where: { statut: 'actif' },
    });
    const totalReservations = await prisma.reservation.count();
    const confirmedReservations = await prisma.reservation.count({
      where: { statut: 'confirmée' },
    });
    const totalBuses = await prisma.bus.count();
    const activeVoyages = await prisma.voyage.count({
      where: { date: { gte: new Date() } }, // Voyages in the future
    });

    // Calculate total revenue (example: sum of confirmed reservations)
    const revenueResult = await prisma.reservation.aggregate({
      _sum: {
        prix: true,
      },
      where: { statut: 'confirmée' },
    });
    const totalRevenue = revenueResult._sum.prix || 0;

    return NextResponse.json({
      totalTrajets,
      activeTrajets,
      totalReservations,
      confirmedReservations,
      totalBuses,
      activeVoyages,
      totalRevenue,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de l\'agence:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques de l\'agence' },
      { status: 500 }
    );
  }
}
