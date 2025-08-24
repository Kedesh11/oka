import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import crypto from 'crypto';
import { sendMail } from '@/server/email/mailer';
import { passwordResetTemplate } from '@/server/email/templates';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
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
