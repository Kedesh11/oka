import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/server/db/prisma';

// GET /api/locations?q=libre
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const items = await prisma.localite.findMany({
      where: q
        ? { name: { contains: q, mode: 'insensitive' } }
        : undefined,
      orderBy: { name: 'asc' },
      select: { name: true },
    });
    const options = items.map((i: { name: string }) => ({ label: i.name, value: i.name }));
    return NextResponse.json(options);
  } catch (error) {
    console.error('Erreur /api/locations GET:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/locations { name: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawName = String(body?.name || '').trim();
    if (!rawName) {
      return NextResponse.json({ error: 'name requis' }, { status: 400 });
    }
    // Normaliser le nom (première lettre majuscule)
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    // Upsert-like behavior
    try {
      const created = await prisma.localite.create({ data: { name } });
      return NextResponse.json({ id: created.id, name: created.name }, { status: 201 });
    } catch (e: any) {
      // Conflit unique -> renvoyer l'existant
      const existing = await prisma.localite.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
      if (existing) {
        return NextResponse.json({ id: existing.id, name: existing.name }, { status: 200 });
      }
      throw e;
    }
  } catch (error) {
    console.error('Erreur /api/locations POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
