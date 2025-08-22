import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/server/integrations/singpay', () => ({
  singpayGetStatusById: vi.fn(),
  singpayGetByReference: vi.fn(),
  singpayGetExternalLink: vi.fn(),
}));

// Minimal prisma mock (define fns inside factory to avoid hoisting issues)
vi.mock('@/server/db/prisma', () => {
  const findUnique = vi.fn();
  const findFirst = vi.fn();
  const update = vi.fn();
  return {
    prisma: {
      reservation: { findUnique, findFirst, update },
    },
  };
});

import { singpayGetStatusById, singpayGetByReference, singpayGetExternalLink } from '@/server/integrations/singpay';
import { prisma } from '@/server/db/prisma';
import { reservationService } from '@/server/services/reservationService';

const originalEnv = { ...process.env };

describe('reservationService - SingPay status and external link', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Object.assign(process.env, originalEnv);
  });
  afterEach(() => {
    Object.assign(process.env, originalEnv);
  });

  it('returns reservation unchanged when transaction not terminated', async () => {
    (prisma.reservation.findUnique as any).mockResolvedValueOnce({ id: 1, paymentReference: 'RES-1', providerTransactionId: 'tx1' });
    (singpayGetStatusById as any).mockResolvedValueOnce({ transaction: { status: 'processing' } });

    const res = await reservationService.getPaymentStatusByIdOrReference({ reservationId: 1 });
    expect(res).toEqual({ id: 1, paymentReference: 'RES-1', providerTransactionId: 'tx1' });
    expect(prisma.reservation.update).not.toHaveBeenCalled();
  });

  it('updates to success when terminated with result success', async () => {
    (prisma.reservation.findUnique as any).mockResolvedValueOnce({ id: 2, paymentReference: 'RES-2', providerTransactionId: 'tx2' });
    (singpayGetStatusById as any).mockResolvedValueOnce({ transaction: { status: 'Terminate', result: 'Success' } });
    (prisma.reservation.update as any).mockResolvedValueOnce({ id: 2, paymentStatus: 'success', statut: 'payee' });

    const res = await reservationService.getPaymentStatusByIdOrReference({ reservationId: 2 });
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: expect.objectContaining({ paymentStatus: 'success', paymentResult: 'Success', statut: 'payee' }),
    });
    expect(res).toEqual({ id: 2, paymentStatus: 'success', statut: 'payee' });
  });

  it('queries by reference when useReference is true', async () => {
    (prisma.reservation.findUnique as any).mockResolvedValueOnce({ id: 3, paymentReference: 'RES-3' });
    (singpayGetByReference as any).mockResolvedValueOnce({ transaction: { status: 'Terminate', result: 'Error' } });
    (prisma.reservation.update as any).mockResolvedValueOnce({ id: 3, paymentStatus: 'failed' });

    const res = await reservationService.getPaymentStatusByIdOrReference({ reservationId: 3, useReference: true });
    expect(singpayGetByReference).toHaveBeenCalledWith('RES-3');
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: expect.objectContaining({ paymentStatus: 'failed', paymentResult: 'Error' }),
    });
    expect(res).toEqual({ id: 3, paymentStatus: 'failed' });
  });

  it('initiateExternalPayment stores link and returns it', async () => {
    process.env.PUBLIC_BASE_URL = 'https://oka.example';
    (prisma.reservation.findUnique as any).mockResolvedValueOnce({ id: 10, totalAmount: 1000 });
    (singpayGetExternalLink as any).mockResolvedValueOnce({ link: 'https://pay.example/abc', exp: '2025-12-31T00:00:00Z' });

    const out = await reservationService.initiateExternalPayment(10);
    expect(singpayGetExternalLink).toHaveBeenCalledWith(expect.objectContaining({ reference: 'RES-10', amount: 1000 }));
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({ paymentStatus: 'pending', externalLink: 'https://pay.example/abc' }),
    });
    expect(out).toEqual({ link: 'https://pay.example/abc', exp: '2025-12-31T00:00:00Z' });
  });
});
