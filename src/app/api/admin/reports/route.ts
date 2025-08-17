import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer tous les rapports
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rapports' },
      { status: 500 }
    );
  }
}

// POST - Générer un nouveau rapport
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Le type de rapport est requis' },
        { status: 400 }
      );
    }

    // Créer le rapport avec statut "En cours"
    const report = await prisma.report.create({
      data: {
        title: `Rapport ${type} - ${new Date().toLocaleDateString('fr-FR')}`,
        type: type as any, // Map to Prisma enum
        status: 'En_cours', // Map to Prisma enum
        content: null,
        url: null,
      },
    });

    // Simuler la génération du rapport (dans un vrai projet, ceci serait une tâche en arrière-plan)
    setTimeout(async () => {
      try {
        // Générer le contenu du rapport selon le type
        let content = {};
        let summary = {};

        switch (type) {
          case 'Ventes':
            const reservations = await prisma.reservation.findMany({
              include: {
                trajet: true,
              },
            });
            const totalRevenue = reservations.reduce((sum, res) => sum + (res.prix || 0), 0);
            content = { reservations, totalRevenue };
            summary = { totalRevenue, totalBookings: reservations.length };
            break;

          case 'Trajets':
            const trajets = await prisma.trajet.findMany({
              include: {
                agence: true,
                reservations: true,
              },
            });
            content = { trajets };
            summary = { totalRoutes: trajets.length };
            break;

          case 'Utilisateurs':
            const users = await prisma.user.findMany({
              include: {
                agence: true,
              },
            });
            content = { users };
            summary = { totalUsers: users.length };
            break;

          case 'Réservations':
            const allReservations = await prisma.reservation.findMany({
              include: {
                trajet: true,
                voyage: true,
              },
            });
            content = { reservations: allReservations };
            summary = { totalBookings: allReservations.length };
            break;

          case 'Satisfaction':
            // Simuler des données de satisfaction
            content = { satisfactionData: [] };
            summary = { averageRating: 4.2 };
            break;
        }

        // Mettre à jour le rapport avec le contenu généré
        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: 'Généré', // Map to Prisma enum
            content: JSON.stringify(content),
            summary: JSON.stringify(summary),
            url: `/api/admin/reports/${report.id}/download`,
          },
        });
      } catch (error) {
        console.error('Erreur lors de la génération du rapport:', error);
        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: 'Échec', // Map to Prisma enum
          },
        });
      }
    }, 2000); // Simuler un délai de 2 secondes

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rapport' },
      { status: 500 }
    );
  }
}
