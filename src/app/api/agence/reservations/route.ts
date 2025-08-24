import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { getRequesterFromHeaders } from '@/server/auth/requester';
export const runtime = 'nodejs';

// Mapping helpers between UI labels (with accents) and Prisma enum values
function toUiStatus(db: string): string {
  switch (db) {
    case 'confirmee':
      return 'confirmée';
    case 'annulee':
      return 'annulée';
    case 'en_attente':
    default:
      return 'en_attente';
  }
}

function toDbStatus(ui: string): 'en_attente' | 'confirmee' | 'annulee' {
  switch (ui) {
    case 'confirmée':
      return 'confirmee';
    case 'annulée':
      return 'annulee';
    case 'en_attente':
    default:
      return 'en_attente';
  }
}

export async function GET(request: NextRequest) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const isGlobal = req.role === 'Admin' || req.agenceId === null;
    const reservations = await prisma.reservation.findMany({
      where: isGlobal ? {} : { trajet: { agenceId: req.agenceId ?? undefined } },
      orderBy: { createdAt: 'desc' },
      include: { trajet: true },
    });

    // Map status to UI values
    const payload = reservations.map((r) => ({
      ...r,
      statut: toUiStatus(r.statut as unknown as string),
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const body = await request.json();
    const { id, statut } = body;

    if (!id || !statut) {
      return NextResponse.json(
        { error: "L'ID et le statut sont requis" },
        { status: 400 }
      );
    }

    // Access control: Admin can update any; otherwise must belong to same agence
    const existing = await prisma.reservation.findUnique({
      where: { id: Number(id) },
      include: { trajet: true },
    });
    if (!existing) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    if (req.role !== 'Admin') {
      if (!req.agenceId || existing.trajet.agenceId !== req.agenceId)
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: Number(id) },
      data: {
        statut: toDbStatus(statut),
      },
      include: { trajet: true },
    });

    // Return with UI status mapping
    return NextResponse.json({ ...updatedReservation, statut: toUiStatus(updatedReservation.statut as unknown as string) });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la réservation' },
      { status: 500 }
    );
  }
}

