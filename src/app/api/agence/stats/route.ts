import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/server/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const agenceId = (session?.user as any)?.agenceId as number | null;
    if (!agenceId) {
      return NextResponse.json({ error: 'Agence non authentifiée' }, { status: 401 });
    }

    const totalTrajets = await prisma.trajet.count({ where: { agenceId } });
    const activeTrajets = await prisma.trajet.count({ where: { agenceId, statut: 'actif' } });
    const totalReservations = await prisma.reservation.count({
      where: { trajet: { agenceId } },
    });
    const confirmedReservations = await prisma.reservation.count({
      where: { statut: 'confirmee', trajet: { agenceId } },
    });
    const totalBuses = await prisma.bus.count({ where: { agenceId } });
    const activeVoyages = await prisma.voyage.count({
      where: { date: { gte: new Date() }, trajet: { agenceId } },
    });

    // Chiffre d'affaires: seulement les réservations confirmées de cette agence
    const confirmedReservationRows = await prisma.reservation.findMany({
      where: { statut: 'confirmee', trajet: { agenceId } },
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
    console.error("Erreur lors de la récupération des statistiques de l'agence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques de l'agence" },
      { status: 500 }
    );
  }
}

