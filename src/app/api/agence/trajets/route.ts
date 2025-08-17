import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // TODO: Filter trajets by agenceId once authentication is implemented
    const trajets = await prisma.trajet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(trajets);
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des trajets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { depart, arrivee, heure, prixAdulte, prixEnfant, statut, agenceId } = body;

    if (!depart || !arrivee || !heure || prixAdulte === undefined || prixEnfant === undefined || !statut || agenceId === undefined) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Ensure the agency exists to avoid FK constraint errors
    const agency = await prisma.agence.findUnique({ where: { id: agenceId } });
    if (!agency) {
      return NextResponse.json(
        { error: "L'agence spécifiée n'existe pas" },
        { status: 400 }
      );
    }

    const newTrajet = await prisma.trajet.create({
      data: {
        depart,
        arrivee,
        heure,
        prixAdulte,
        prixEnfant,
        statut: statut as any, // Cast to match Prisma enum type
        agenceId,
      },
    });

    return NextResponse.json(newTrajet, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du trajet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du trajet' },
      { status: 500 }
    );
  }
}
