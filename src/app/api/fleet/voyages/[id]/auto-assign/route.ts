import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { getRequesterFromHeaders } from '@/server/auth/requester';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const req = await getRequesterFromHeaders(request.headers);
    const voyageId = parseInt(params.id);

    if (isNaN(voyageId)) {
      return NextResponse.json({ error: 'ID de voyage invalide' }, { status: 400 });
    }

    const voyage = await prisma.voyage.findUnique({
      where: { id: voyageId },
      include: {
        trajet: { select: { agenceId: true } },
        bus: {
          include: {
            seats: true,
          },
        },
        reservations: {
          include: {
            passengers: true,
          },
        },
        assignments: true, // Existing assignments
      },
    });

    if (!voyage) {
      return NextResponse.json({ error: 'Voyage non trouvé' }, { status: 404 });
    }

    // Admin plateforme: lecture seule -> POST interdit
    if (req.role === 'Admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    if (!req.agenceId || voyage.trajet.agenceId !== req.agenceId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const availableSeats = voyage.bus.seats.filter(seat =>
      !voyage.assignments.some(assignment => assignment.busSeatId === seat.id)
    );

    const passengersToAssign = voyage.reservations.flatMap(reservation =>
      reservation.passengers.filter(passenger =>
        !voyage.assignments.some(assignment => assignment.passengerId === passenger.id)
      )
    );

    let assignedCount = 0;
    const newAssignments = [];

    for (let i = 0; i < passengersToAssign.length && i < availableSeats.length; i++) {
      newAssignments.push({
        voyageId,
        busSeatId: availableSeats[i].id,
        passengerId: passengersToAssign[i].id,
      });
      assignedCount++;
    }

    if (newAssignments.length > 0) {
      await prisma.seatAssignment.createMany({ data: newAssignments });
    }

    return NextResponse.json({
      assigned: assignedCount,
      total: passengersToAssign.length,
      message: `${assignedCount} passagers assignés sur ${passengersToAssign.length} en attente.`,
    });
  } catch (error) {
    console.error('Erreur lors de l\'auto-assignation des sièges:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'auto-assignation des sièges' },
      { status: 500 }
    );
  }
}
