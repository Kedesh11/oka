import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Mock reservationService used by the route
vi.mock('@/server/services/reservationService', () => ({
  reservationService: {
    applySingpayCallback: vi.fn(async (body: any) => ({ id: 'res_1', paymentStatus: body?.status ?? 'pending' })),
  },
}));

import { POST } from '@/app/api/payments/singpay/callback/route';

function makeReq(payload: any, headers: Record<string, string> = {}) {
  const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const h = new Map<string, string>();
  for (const [k, v] of Object.entries(headers)) h.set(k.toLowerCase(), v);
  return {
    text: async () => raw,
    headers: {
      get: (k: string) => h.get(k.toLowerCase()) || null,
    },
  } as any; // minimal NextRequest-like
}

const originalEnv = { ...process.env };

describe('SingPay webhook route', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    Object.assign(process.env, originalEnv);
  });

  it('accepts request without signature when secret is not set', async () => {
    delete process.env.SINGPAY_WEBHOOK_SECRET;
    const payload = { reference: 'R1', status: 'success' };
    const res = await POST(makeReq(payload));
    const json = await (res as any).json();
    expect((res as any).status).toBe(200);
    expect(json).toMatchObject({ ok: true, reservationId: 'res_1', paymentStatus: 'success' });
  });

  it('rejects with 401 when signature invalid', async () => {
    process.env.SINGPAY_WEBHOOK_SECRET = 'secret';
    const payload = { reference: 'R2', status: 'failed' };
    const wrongSig = crypto.createHmac('sha256', 'other').update(JSON.stringify(payload), 'utf8').digest('hex');
    const res = await POST(makeReq(payload, { 'x-signature': wrongSig }));
    const json = await (res as any).json();
    expect((res as any).status).toBe(401);
    expect(json).toMatchObject({ error: 'INVALID_SIGNATURE' });
  });

  it('accepts with 200 when signature valid', async () => {
    process.env.SINGPAY_WEBHOOK_SECRET = 'top_secret';
    const payload = { reference: 'R3', status: 'success' };
    const goodSig = crypto.createHmac('sha256', 'top_secret').update(JSON.stringify(payload), 'utf8').digest('hex');
    const res = await POST(makeReq(payload, { 'x-signature': goodSig }));
    const json = await (res as any).json();
    expect((res as any).status).toBe(200);
    expect(json).toMatchObject({ ok: true, reservationId: 'res_1', paymentStatus: 'success' });
  });

  it('returns 400 on empty body', async () => {
    const req = {
      text: async () => '',
      headers: { get: () => null },
    } as any;
    const res = await POST(req);
    const json = await (res as any).json();
    expect((res as any).status).toBe(400);
    expect(json).toMatchObject({ error: 'EMPTY_BODY' });
  });
});
