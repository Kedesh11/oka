import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/server/db/prisma';

export async function GET() {
  try {
    const totalTrajets = await prisma.trajet.count();
    const activeTrajets = await prisma.trajet.count({
      where: { statut: 'actif' },
    });
    const totalReservations = await prisma.reservation.count();
    const confirmedReservations = await prisma.reservation.count({
      where: { statut: 'confirmee' },
    });
    const totalBuses = await prisma.bus.count();
    const activeVoyages = await prisma.voyage.count({
      where: { date: { gte: new Date() } }, // Voyages in the future
    });

    // Calculate total revenue from confirmed reservations based on trajet prices
    const confirmedReservationRows = await prisma.reservation.findMany({
      where: { statut: 'confirmee' },
      include: { trajet: true },
    });
    const totalRevenue = confirmedReservationRows.reduce((sum, res) => {
      const adults = Math.max((res.nbVoyageurs || 0) - (res.childrenCount || 0), 0);
      const children = res.childrenCount || 0;
      const adultPrice = res.trajet?.prixAdulte || 0;
      const childPrice = res.trajet?.prixEnfant || 0;
      return sum + adults * adultPrice + children * childPrice;
    }, 0);

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

