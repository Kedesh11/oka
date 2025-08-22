import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const blob = file as unknown as Blob;
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = (file as any).name?.split('.').pop() || 'png';
    const base = (file as any).name?.split('.')[0] || 'logo';
    const filename = `${base}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: 'Échec de l\'upload' }, { status: 500 });
  }
}
