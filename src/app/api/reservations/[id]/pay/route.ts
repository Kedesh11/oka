import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/server/services/reservationService';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const validation = paramsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 });
    }

    const reservationId = validation.data.id;
    // Note: In a real application, you would integrate a payment gateway here.
    // For this simulation, we'll directly mark the reservation as paid.
    const updatedReservation = await reservationService.finalizePayment(reservationId);

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Payment finalization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
