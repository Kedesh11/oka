import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer les statistiques système
export async function GET() {
  try {
    // Compter les agences
    const agenciesCount = await prisma.agence.count();
    
    // Compter les utilisateurs
    const usersCount = await prisma.user.count();
    
    // Compter les voyages actifs (ceux qui ont une date future)
    const activeVoyagesCount = await prisma.voyage.count({
      where: {
        date: {
          gte: new Date(),
        },
      },
    });
    
    // Calculer les revenus (somme des prix des réservations confirmées)
    const confirmedReservations = await prisma.reservation.findMany({
      where: {
        statut: 'confirmee',
      },
      include: {
        trajet: true,
      },
    });
    
    const totalRevenue = confirmedReservations.reduce((sum, reservation) => {
      const adultPrice = reservation.trajet.prixAdulte * (reservation.nbVoyageurs - reservation.childrenCount);
      const childPrice = reservation.trajet.prixEnfant * reservation.childrenCount;
      return sum + adultPrice + childPrice;
    }, 0);
    
    // Calculer le taux de réservation (réservations confirmées / total des voyages)
    const totalVoyages = await prisma.voyage.count();
    const confirmedReservationsCount = await prisma.reservation.count({
      where: {
        statut: 'confirmee',
      },
    });
    
    const bookingRate = totalVoyages > 0 ? Math.round((confirmedReservationsCount / totalVoyages) * 100) : 0;
    
    // Statistiques simulées pour la satisfaction et la ponctualité
    const satisfactionRate = 92; // Simulé
    const punctualityRate = 78; // Simulé
    
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
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
