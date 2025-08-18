import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 });

    const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!rec) return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    if (rec.usedAt) return NextResponse.json({ error: 'Token déjà utilisé' }, { status: 400 });
    if (rec.expiresAt < new Date()) return NextResponse.json({ error: 'Token expiré' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: rec.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
      // Optionnel: invalider les autres tokens actifs de ce user
      prisma.passwordResetToken.deleteMany({ where: { userId: rec.userId, usedAt: null, id: { not: rec.id } } })
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('POST /api/auth/reset', e);
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 });
  }
}
