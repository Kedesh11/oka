import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reservationService } from '@/server/services/reservationService';
import { makeOpaqueUrl } from '@/server/utils/crypto';

const BodySchema = z.object({
  reservationId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
    }

    const { reservationId } = parsed.data;
    const { link, exp } = await reservationService.initiateExternalPayment(reservationId);
    const opaque = makeOpaqueUrl(link);
    return NextResponse.json({ link: opaque, exp });
  } catch (e) {
    console.error('[POST /api/payments/ext-link]', e);
    const msg = e instanceof Error ? e.message : 'Server error';
    const status = msg === 'RESERVATION_NOT_FOUND' ? 404 : msg === 'RESERVATION_AMOUNT_NOT_SET' ? 400 : msg === 'PUBLIC_BASE_URL_NOT_SET' ? 500 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
