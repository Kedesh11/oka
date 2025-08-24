import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import crypto from 'crypto';
import { sendMail } from '@/server/email/mailer';
import { passwordResetTemplate } from '@/server/email/templates';

export const runtime = 'nodejs';

// In-memory rate limiter (simple) : 5 requêtes / 15 minutes par IP
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateStore = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = rateStore.get(ip);
  if (!rec) {
    rateStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (now - rec.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  rec.count += 1;
  rateStore.set(ip, rec);
  return rec.count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
      // 429 Too Many Requests, message neutre
      return NextResponse.json({ ok: true }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Réponse 200 même si l'utilisateur n'existe pas (ne pas divulguer)
    if (!user) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const { subject, html } = passwordResetTemplate({ resetUrl });
    await sendMail({ to: email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('POST /api/auth/forgot', e);
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 });
  }
}
