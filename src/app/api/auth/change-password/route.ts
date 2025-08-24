import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import bcrypt from 'bcryptjs';
import { getRequesterFromHeaders } from '@/server/auth/requester';
import { validatePassword } from '@/server/auth/passwordPolicy';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const requester = await getRequesterFromHeaders(req.headers);
    if (!requester?.userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) return NextResponse.json({ error: 'Champs requis' }, { status: 400 });

    const policy = validatePassword(newPassword);
    if (!policy.ok) return NextResponse.json({ error: policy.error }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: requester.userId } });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return NextResponse.json({ error: 'Mot de passe actuel invalide' }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('POST /api/auth/change-password', e);
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 });
  }
}
