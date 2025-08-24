import { NextRequest, NextResponse } from "next/server";
export const runtime = 'nodejs';
import { sendMail } from "@/server/email/mailer";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Endpoint disabled in production' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const to = String(body?.to || '').trim();
    const subject = String(body?.subject || 'Test email OKA').trim();
    const text = String(body?.text || 'Ceci est un email de test OKA.').trim();

    if (!to) {
      return NextResponse.json({ error: 'Paramètre "to" requis' }, { status: 400 });
    }

    await sendMail({ to, subject, text });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[POST /api/dev/email/test] error:', err);
    return NextResponse.json({ error: err?.message || 'Erreur envoi email' }, { status: 500 });
  }
}
