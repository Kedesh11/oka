import { z } from 'zod';

function getBaseUrl() {
  return process.env.SINGPAY_BASE_URL ?? 'https://gateway.singpay.ga/v1';
}
const CLIENT_ID = process.env.SINGPAY_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.SINGPAY_CLIENT_SECRET ?? '';
const WALLET_ID = process.env.SINGPAY_WALLET_ID ?? '';

// Minimal runtime guard for SingPay responses
export const SingPayTransactionSchema = z.object({
  transaction: z.object({
    status: z.string().optional(),
    result: z.string().optional(),
    id: z.string().optional(),
    _id: z.string().optional(),
    reference: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    client_msisdn: z.string().optional(),
    portefeuille: z.any().optional(),
    updated_at: z.string().optional(),
    created_at: z.string().optional(),
  }).optional(),
  status: z.object({
    code: z.string().optional(),
    message: z.string().optional(),
    success: z.boolean().optional(),
    result_code: z.string().optional(),
  }).optional(),
});

function authHeaders(extra?: Record<string, string>) {
  return {
    'Content-Type': 'application/json',
    'x-client-id': CLIENT_ID,
    'x-client-secret': CLIENT_SECRET,
    'x-wallet': WALLET_ID,
    ...(extra ?? {}),
  } as Record<string, string>;
}

export type Operator = 'airtel' | 'moov' | 'maviance' | 'ext';

function operatorPath(op: Operator): string {
  switch (op) {
    case 'airtel':
      return '/74/paiement';
    case 'moov':
      return '/62/paiement';
    case 'maviance':
      return '/maviance/paiement';
    default:
      throw new Error('Unsupported operator for USSD');
  }
}

export async function singpayInitiatePayment(params: {
  operator: Operator;
  amount: number;
  reference: string;
  client_msisdn: string;
  portefeuille?: string;
  disbursement?: string;
  isTransfer?: boolean;
  mavianceServiceNumber?: string;
}) {
  // Some SingPay operator endpoints expect MSISDN in national 8-digit format.
  let clientMsisdn = params.client_msisdn;
  if ((params.operator === 'airtel' || params.operator === 'moov') && /^241\d{8}$/.test(clientMsisdn)) {
    clientMsisdn = clientMsisdn.slice(3); // send 8-digit national format
  }

  const body: any = {
    amount: params.amount,
    reference: params.reference,
    client_msisdn: clientMsisdn,
    portefeuille: params.portefeuille ?? WALLET_ID,
    disbursement: params.disbursement,
    isTransfer: params.isTransfer ?? false,
  };
  if (params.operator === 'maviance' && params.mavianceServiceNumber) {
    body.mavianceServiceNumber = params.mavianceServiceNumber;
  }

  if (process.env.NODE_ENV !== 'production') {
    const masked = (s: string) => (s?.length > 4 ? s.slice(0, 2) + '•••' + s.slice(-2) : '***');
    // Do not log CLIENT_ID/SECRET. Log only non-sensitive payload and minimal wallet info.
    console.debug('[SingPay:initiate] op=%s amount=%s ref=%s msisdn=%s wallet=%s',
      params.operator,
      String(body.amount),
      body.reference,
      masked(String(body.client_msisdn)),
      masked(String(body.portefeuille))
    );
  }

  const res = await fetch(`${getBaseUrl()}${operatorPath(params.operator)}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`SingPay initiate failed: ${res.status} ${txt?.slice(0, 300)}`);
  }
  const json = await res.json();
  const parsed = SingPayTransactionSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('SingPay response parse error');
  }
  return parsed.data;
}

export async function singpayGetStatusById(id: string) {
  const res = await fetch(`${getBaseUrl()}/transaction/api/status/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`SingPay status failed: ${res.status} ${txt?.slice(0, 300)}`);
  }
  const json = await res.json();
  const parsed = SingPayTransactionSchema.safeParse(json);
  if (!parsed.success) throw new Error('SingPay status parse error');
  return parsed.data;
}

export async function singpayGetByReference(reference: string) {
  const res = await fetch(`${getBaseUrl()}/transaction/api/search/by-reference/${reference}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`SingPay by reference failed: ${res.status} ${txt?.slice(0, 300)}`);
  }
  const json = await res.json();
  const parsed = SingPayTransactionSchema.safeParse(json);
  if (!parsed.success) throw new Error('SingPay by reference parse error');
  return parsed.data;
}

export async function singpayGetExternalLink(params: {
  reference: string;
  amount: number;
  redirect_success: string;
  redirect_error: string;
  portefeuille?: string;
  disbursement?: string;
  logoURL?: string;
  isTransfer?: boolean;
}) {
  const body = {
    portefeuille: params.portefeuille ?? WALLET_ID,
    reference: params.reference,
    redirect_success: params.redirect_success,
    redirect_error: params.redirect_error,
    amount: params.amount,
    disbursement: params.disbursement,
    logoURL: params.logoURL,
    isTransfer: params.isTransfer ?? false,
  };
  const res = await fetch(`${getBaseUrl()}/ext`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`SingPay ext failed: ${res.status} ${txt?.slice(0, 300)}`);
  }
  const json = await res.json();
  return json as { link: string; exp: string };
}
