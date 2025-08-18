import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { getRequesterFromHeaders } from '@/server/auth/requester';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const isGlobal = req.role === 'Admin' || req.agenceId === null;
    const trajets = await prisma.trajet.findMany({
      where: isGlobal ? {} : { agenceId: req.agenceId ?? undefined },
      orderBy: { createdAt: 'desc' },
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
    const reqr = await getRequesterFromHeaders(request.headers);
    const body = await request.json();
    const { depart, arrivee, heure, prixAdulte, prixEnfant, statut, agenceId } = body;

    if (!depart || !arrivee || !heure || prixAdulte === undefined || prixEnfant === undefined || !statut || agenceId === undefined) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Enforce access: Admin peut créer pour n'importe quelle agence; sinon, forcer agenceId=requérant.agenceId
    let finalAgenceId = agenceId as number;
    if (reqr.role !== 'Admin') {
      if (!reqr.agenceId) {
        return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
      }
      finalAgenceId = reqr.agenceId;
    }

    // Ensure the agency exists to avoid FK constraint errors
    const agency = await prisma.agence.findUnique({ where: { id: finalAgenceId } });
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
        agenceId: finalAgenceId,
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
