import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { getRequesterFromHeaders } from '@/server/auth/requester';
export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de trajet invalide' }, { status: 400 });
    }

    // Access control
    const requester = await getRequesterFromHeaders(request.headers);
    const existing = await prisma.trajet.findUnique({ where: { id }, select: { id: true, agenceId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 });
    }
    const isAdmin = requester.role === 'Admin';
    const sameAgency = requester.agenceId != null && requester.agenceId === existing.agenceId;
    if (!isAdmin && !sameAgency) {
      console.warn('[trajets.PUT] Accès refusé', {
        id,
        requester: {
          email: requester.email,
          role: requester.role,
          agenceId: requester.agenceId,
        },
        existingAgenceId: existing.agenceId,
        reason: 'Requester not admin and agency mismatch',
      });
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { depart, arrivee, heure, prixAdulte, prixEnfant, statut } = body;

    if (!depart || !arrivee || !heure || prixAdulte === undefined || prixEnfant === undefined || !statut) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const updatedTrajet = await prisma.trajet.update({
      where: { id },
      data: {
        depart,
        arrivee,
        heure,
        prixAdulte,
        prixEnfant,
        statut: statut as any,
      },
    });

    return NextResponse.json(updatedTrajet);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du trajet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du trajet' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de trajet invalide' }, { status: 400 });
    }

    // Access control
    const requester = await getRequesterFromHeaders(request.headers);
    const existing = await prisma.trajet.findUnique({ where: { id }, select: { id: true, agenceId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 });
    }
    const isAdmin = requester.role === 'Admin';
    const sameAgency = requester.agenceId != null && requester.agenceId === existing.agenceId;
    if (!isAdmin && !sameAgency) {
      console.warn('[trajets.DELETE] Accès refusé', {
        id,
        requester: {
          email: requester.email,
          role: requester.role,
          agenceId: requester.agenceId,
        },
        existingAgenceId: existing.agenceId,
        reason: 'Requester not admin and agency mismatch',
      });
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.trajet.delete({ where: { id } });

    return NextResponse.json({ message: 'Trajet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du trajet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du trajet' },
      { status: 500 }
    );
  }
}
