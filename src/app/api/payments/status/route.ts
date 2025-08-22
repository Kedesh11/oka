import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reservationService } from '@/server/services/reservationService';

const QuerySchema = z.object({
  reservationId: z.coerce.number().int().positive(),
  useReference: z.coerce.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query', details: parsed.error.flatten() }, { status: 400 });
    }

    const { reservationId, useReference } = parsed.data;
    const updated = await reservationService.getPaymentStatusByIdOrReference({ reservationId, useReference });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('[GET /api/payments/status]', e);
    const msg = e instanceof Error ? e.message : 'Server error';
    const status = msg === 'RESERVATION_NOT_FOUND' ? 404 : msg === 'PAYMENT_NOT_INITIATED' ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
