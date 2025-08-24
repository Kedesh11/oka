import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { getRequesterFromHeaders } from '@/server/auth/requester';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

    const existing = await prisma.reservation.findUnique({
      where: { id },
      include: { trajet: true },
    });
    if (!existing) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });

    if (req.role !== 'Admin') {
      if (!req.agenceId || existing.trajet.agenceId !== req.agenceId)
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete child passengers and assignments via relations
      await tx.seatAssignment.deleteMany({ where: { passenger: { reservationId: id } } });
      await tx.reservationPassenger.deleteMany({ where: { reservationId: id } });
      await tx.reservation.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
