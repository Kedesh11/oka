import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { singpayInitiatePayment } from '@/server/integrations/singpay';

const originalEnv = { ...process.env };

describe('singpayInitiatePayment', () => {
  beforeEach(() => {
    process.env.SINGPAY_BASE_URL = 'https://example.test/v1';
    process.env.SINGPAY_CLIENT_ID = 'cid';
    process.env.SINGPAY_CLIENT_SECRET = 'csec';
    process.env.SINGPAY_WALLET_ID = 'wallet123';
  });

  afterEach(() => {
    Object.assign(process.env, originalEnv);
    vi.unstubAllGlobals();
  });

  it('sends national 8-digit msisdn to airtel/moov when provided as 241XXXXXXXX', async () => {
    const fetchMock = vi.fn(async (url: any, init?: any) => {
      expect(url).toBe('https://example.test/v1/74/paiement'); // airtel path
      const body = JSON.parse(init!.body);
      expect(body.client_msisdn).toBe('06123456'); // 241 stripped to 8 digits
      return {
        ok: true,
        json: async () => ({ transaction: { id: 'tx1', status: 'pending' }, status: { success: true } }),
      } as any;
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await singpayInitiatePayment({
      operator: 'airtel',
      amount: 1000,
      reference: 'REF-1',
      client_msisdn: '24106123456',
    });
    expect(res.transaction?.id).toBe('tx1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes mavianceServiceNumber when operator is maviance', async () => {
    const fetchMock = vi.fn(async (url: any, init?: any) => {
      expect(url).toBe('https://example.test/v1/maviance/paiement');
      const body = JSON.parse(init!.body);
      expect(body.mavianceServiceNumber).toBe('svc-42');
      return { ok: true, json: async () => ({ transaction: { id: 'tx2', status: 'pending' } }) } as any;
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await singpayInitiatePayment({
      operator: 'maviance',
      amount: 500,
      reference: 'REF-2',
      client_msisdn: '24177111222',
      mavianceServiceNumber: 'svc-42',
    });
    expect(res.transaction?.id).toBe('tx2');
  });
});
