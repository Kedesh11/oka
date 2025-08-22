import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UpdateReservationDetailsSchema } from '@/features/reservations/schemas';
import { reservationService } from '@/server/services/reservationService';

const ParamsSchema = z.object({
  id: z.coerce.number().int(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paramsParsed = ParamsSchema.safeParse(params);
    if (!paramsParsed.success) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    const reservation = await reservationService.getById(paramsParsed.data.id);
    return NextResponse.json(reservation);

  } catch (e) {
    console.error(`[GET /api/reservations/${params.id}]`, e);
    const msg = e instanceof Error ? e.message : 'Server error';

    if (msg === 'RESERVATION_NOT_FOUND') {
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paramsParsed = ParamsSchema.safeParse(params);
    if (!paramsParsed.success) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    const body = await req.json();
    const bodyParsed = UpdateReservationDetailsSchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json({ error: 'Invalid body', details: bodyParsed.error.flatten() }, { status: 400 });
    }

    const updated = await reservationService.updateDetails(paramsParsed.data.id, bodyParsed.data);
    return NextResponse.json(updated);

  } catch (e) {
    console.error(`[PUT /api/reservations/${params.id}]`, e);
    const msg = e instanceof Error ? e.message : 'Server error';

    if (msg === 'RESERVATION_NOT_FOUND') {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg === 'RESERVATION_NOT_UPDATABLE' || msg === 'TRAVELER_COUNT_MISMATCH') {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
