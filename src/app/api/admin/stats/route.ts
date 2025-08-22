import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/server/db/prisma';

// GET - Récupérer les statistiques système
export async function GET() {
  // Helpers robustes pour éviter les 500 en cas de migrations incomplètes
  const safeCount = async (cb: () => Promise<number>): Promise<number> => {
    try { return await cb(); } catch { return 0; }
  };
  const safeFindMany = async <T>(cb: () => Promise<T[]>): Promise<T[]> => {
    try { return await cb(); } catch { return []; }
  };

  const [agenciesCount, usersCount, activeVoyagesCount] = await Promise.all([
    safeCount(() => prisma.agence.count()),
    safeCount(() => prisma.user.count()),
    safeCount(() => prisma.voyage.count({ where: { date: { gte: new Date() } } })),
  ]);

  const confirmedReservations = await safeFindMany(() => prisma.reservation.findMany({
    where: { statut: 'confirmee' },
    include: { trajet: true },
  }));

  const totalRevenue = confirmedReservations.reduce((sum: number, reservation: any) => {
    const nbVoyageurs = Number(reservation?.nbVoyageurs ?? 0) || 0;
    const childrenCount = Number(reservation?.childrenCount ?? 0) || 0;
    const adultCount = Math.max(nbVoyageurs - childrenCount, 0);
    const prixAdulte = Number(reservation?.trajet?.prixAdulte ?? 0) || 0;
    const prixEnfant = Number(reservation?.trajet?.prixEnfant ?? 0) || 0;
    return sum + (adultCount * prixAdulte) + (childrenCount * prixEnfant);
  }, 0);

  const [totalVoyages, confirmedReservationsCount] = await Promise.all([
    safeCount(() => prisma.voyage.count()),
    safeCount(() => prisma.reservation.count({ where: { statut: 'confirmee' } })),
  ]);
  const bookingRate = totalVoyages > 0 ? Math.round((confirmedReservationsCount / totalVoyages) * 100) : 0;

  // Valeurs simulées stables
  const satisfactionRate = 92;
  const punctualityRate = 78;

  const stats = {
    agencies: agenciesCount,
    users: usersCount,
    activeVoyages: activeVoyagesCount,
    revenue: new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(totalRevenue),
    bookingRate,
    satisfactionRate,
    punctualityRate,
  };

  return NextResponse.json(stats);
}
