import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reservationService } from '@/server/services/reservationService';
import { normalizeGabonMsisdn, detectOperatorFromMsisdn } from '@/lib/phone';

const BodySchema = z.object({
  reservationId: z.number().int().positive(),
  operator: z.enum(['airtel', 'moov', 'maviance']).optional(),
  msisdn: z.string().min(7),
  isTransfer: z.boolean().optional(),
  mavianceServiceNumber: z.string().optional(),
});

// Normalisation et détection importées depuis '@/lib/phone'

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
    }

    let { reservationId, operator, msisdn, isTransfer, mavianceServiceNumber } = parsed.data;
    const norm = normalizeGabonMsisdn(msisdn);
    if (!norm) {
      return NextResponse.json({ error: 'INVALID_MSISDN' }, { status: 400 });
    }
    msisdn = norm;
    // Honore l'opérateur fourni, sinon auto-détecte depuis le numéro
    if (!operator) {
      const auto = detectOperatorFromMsisdn(msisdn);
      if (!auto) {
        return NextResponse.json({ error: 'OPERATOR_NOT_DETECTABLE' }, { status: 400 });
      }
      operator = auto;
    }
    const updated = await reservationService.initiatePayment(reservationId, { operator, msisdn, isTransfer, mavianceServiceNumber });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('[POST /api/payments/initiate]', e);
    const msg = e instanceof Error ? e.message : 'Server error';
    // En dev, on expose davantage d'infos pour faciliter le debug des erreurs SingPay
    if (process.env.NODE_ENV !== 'production' && typeof msg === 'string' && msg.startsWith('SingPay initiate failed:')) {
      // msg format: "SingPay initiate failed: <code> <body>"
      return NextResponse.json({ error: 'SINGPAY_INITIATE_FAILED', detail: msg }, { status: 400 });
    }
    const status =
      msg === 'RESERVATION_NOT_FOUND' ? 404 :
      msg === 'RESERVATION_AMOUNT_NOT_SET' ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
