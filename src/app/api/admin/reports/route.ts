import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer tous les rapports
export async function GET() {
  try {
    // Pour l'instant, retournons des données simulées
    // Dans un vrai projet, ces rapports seraient stockés en base de données
    const reports = [
      {
        id: 1,
        title: 'Rapport mensuel des ventes',
        type: 'Ventes',
        date: '2024-01-15',
        status: 'Généré',
        url: '/reports/sales-january-2024.pdf'
      },
      {
        id: 2,
        title: 'Analyse des trajets populaires',
        type: 'Trajets',
        date: '2024-01-14',
        status: 'En cours',
        url: null
      },
      {
        id: 3,
        title: 'Rapport de satisfaction client',
        type: 'Satisfaction',
        date: '2024-01-13',
        status: 'Généré',
        url: '/reports/satisfaction-january-2024.pdf'
      },
      {
        id: 4,
        title: 'Rapport des utilisateurs',
        type: 'Utilisateurs',
        date: '2024-01-12',
        status: 'Généré',
        url: '/reports/users-january-2024.pdf'
      },
      {
        id: 5,
        title: 'Rapport des réservations',
        type: 'Réservations',
        date: '2024-01-11',
        status: 'Généré',
        url: '/reports/reservations-january-2024.pdf'
      }
    ];

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

    // Simuler la génération d'un rapport
    const newReport = {
      id: Date.now(),
      title: `Rapport ${type} - ${new Date().toLocaleDateString('fr-FR')}`,
      type,
      date: new Date().toISOString().split('T')[0],
      status: 'Généré',
      url: `/reports/${type.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
    };

    // Dans un vrai projet, on sauvegarderait le rapport en base de données
    // et on générerait le fichier PDF

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}
