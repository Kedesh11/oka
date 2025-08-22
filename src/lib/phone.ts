// Shared phone utilities for Gabon numbers and operator detection
// Format normalisé: 241XXXXXXXX (8 chiffres après 241)

export type DetectedOperator = 'airtel' | 'moov' | 'maviance' | null;

export function normalizeGabonMsisdn(input: string): string | null {
  const digits = (input || '').replace(/\D+/g, '');
  let rest = digits;
  if (rest.startsWith('00241')) rest = rest.slice(5);
  else if (rest.startsWith('241')) rest = rest.slice(3);
  else if (rest.startsWith('+241')) rest = rest.slice(4);
  else if (rest.startsWith('0')) rest = rest.slice(1);
  if (rest.length === 7 && /^(5|6|7)\d{6}$/.test(rest)) {
    rest = `0${rest}`;
  }
  if (rest.length !== 8) return null;
  const prefix2 = rest.slice(0, 2);
  const prefix3 = rest.slice(0, 3);
  // Autoriser également les entrées commençant par 06 (format national couramment saisi)
  const allowed2 = ['06', '60', '62', '65', '66', '77', '74'];
  const allowed3 = ['060', '062', '065', '066', '077', '074'];
  if (!allowed2.includes(prefix2) && !allowed3.includes(prefix3)) return null;
  return `241${rest}`;
}

export function detectOperatorFromMsisdn(msisdn: string): DetectedOperator {
  const normalized = normalizeGabonMsisdn(msisdn);
  if (!normalized) return null;
  const national = normalized.slice(3);
  const p2 = national.slice(0, 2);
  // Mapping simplifié: 77/74 => Airtel, 60/62/65/66 => Moov
  if (p2 === '77' || p2 === '74') return 'airtel';
  if (p2 === '60' || p2 === '62' || p2 === '65' || p2 === '66') return 'moov';
  return null; // Maviance ne se déduit pas du MSISDN
}
