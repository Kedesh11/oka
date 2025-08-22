import { NextRequest, NextResponse } from 'next/server';
import { reservationService } from '@/server/services/reservationService';
import crypto from 'crypto';

// Optional: if SingPay provides a signing secret, validate here
// Example env: SINGPAY_WEBHOOK_SECRET
// For now, we accept without signature and rely on allowlists/rate limits at the edge/proxy.

export async function POST(req: NextRequest) {
  try {
    // Read raw body for signature verification
    const raw = await req.text();
    if (!raw) {
      return NextResponse.json({ error: 'EMPTY_BODY' }, { status: 400 });
    }

    // Optional signature verification (HMAC-SHA256 over raw body)
    const secret = process.env.SINGPAY_WEBHOOK_SECRET;
    if (secret) {
      const provided = req.headers.get('x-signature') || '';
      const computed = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
      if (!provided || provided.toLowerCase() !== computed.toLowerCase()) {
        return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
      }
    }

    const body = JSON.parse(raw);

    const updated = await reservationService.applySingpayCallback(body);
    return NextResponse.json({ ok: true, reservationId: updated.id, paymentStatus: updated.paymentStatus });
  } catch (e) {
    console.error('[POST /api/payments/singpay/callback]', e);
    const msg = e instanceof Error ? e.message : 'Server error';
    const status = msg === 'RESERVATION_NOT_FOUND' ? 404 : msg === 'CALLBACK_MISSING_KEYS' ? 400 : msg === 'INVALID_SIGNATURE' ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
