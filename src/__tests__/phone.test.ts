import { describe, it, expect } from 'vitest';
import { normalizeGabonMsisdn, detectOperatorFromMsisdn } from '@/lib/phone';

describe('phone utils', () => {
  describe('normalizeGabonMsisdn', () => {
    it('normalizes local formats to 241XXXXXXXX', () => {
      expect(normalizeGabonMsisdn('06 12 34 56')).toBe('24106123456');
      expect(normalizeGabonMsisdn('6 12 34 56')).toBe('24106123456');
      expect(normalizeGabonMsisdn('+24106123456')).toBe('24106123456');
      expect(normalizeGabonMsisdn('0024106123456')).toBe('24106123456');
      expect(normalizeGabonMsisdn('24106123456')).toBe('24106123456');
    });

    it('rejects invalid numbers', () => {
      expect(normalizeGabonMsisdn('123')).toBeNull();
      expect(normalizeGabonMsisdn('2411234567')).toBeNull(); // wrong prefix
      expect(normalizeGabonMsisdn('07123456789')).toBeNull(); // too long
    });
  });

  describe('detectOperatorFromMsisdn', () => {
    it('detects airtel for 77/74', () => {
      expect(detectOperatorFromMsisdn('077123456')).toBe('airtel');
      expect(detectOperatorFromMsisdn('74123456')).toBe('airtel');
      expect(detectOperatorFromMsisdn('+24177123456')).toBe('airtel');
    });
    it('detects moov for 60/62/65/66', () => {
      expect(detectOperatorFromMsisdn('066123456')).toBe('moov');
      expect(detectOperatorFromMsisdn('65123456')).toBe('moov');
      expect(detectOperatorFromMsisdn('+24162123456')).toBe('moov');
    });
    it('returns null for unknown prefixes (e.g., maviance)', () => {
      expect(detectOperatorFromMsisdn('07123456')).toBeNull();
    });
  });
});
