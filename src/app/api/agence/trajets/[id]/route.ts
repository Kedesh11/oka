import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de trajet invalide' }, { status: 400 });
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
