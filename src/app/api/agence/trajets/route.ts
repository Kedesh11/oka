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

    // Champs obligatoires communs (agenceId sera validé selon le rôle plus bas)
    if (!depart || !arrivee || !heure || prixAdulte === undefined || prixEnfant === undefined || !statut) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Enforce access et déterminer l'agence cible
    let finalAgenceId: number | null = null;
    if (reqr.role === 'Admin') {
      if (agenceId === undefined || !Number.isFinite(Number(agenceId))) {
        return NextResponse.json({ error: "Paramètre agenceId requis pour l'Admin" }, { status: 400 });
      }
      finalAgenceId = Number(agenceId);
    } else {
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

    // Create trajet A->B and ensure B->A exists (idempotent) within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create forward trajet (A->B)
      const created = await tx.trajet.create({
        data: {
          depart,
          arrivee,
          heure,
          prixAdulte,
          prixEnfant,
          statut: statut as any,
          agenceId: finalAgenceId,
        },
      });

      // Check if reverse trajet (B->A) already exists with same heure
      const reverseExists = await tx.trajet.findFirst({
        where: {
          agenceId: finalAgenceId,
          depart: arrivee,
          arrivee: depart,
          heure,
        },
      });

      if (!reverseExists) {
        await tx.trajet.create({
          data: {
            depart: arrivee,
            arrivee: depart,
            heure,
            prixAdulte,
            prixEnfant,
            statut: statut as any,
            agenceId: finalAgenceId,
          },
        });
      }

      return created;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du trajet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du trajet' },
      { status: 500 }
    );
  }
}
