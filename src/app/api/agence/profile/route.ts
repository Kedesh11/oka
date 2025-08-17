import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // TODO: Get agenceId from authenticated user session
    const agenceId = 1; // Placeholder for now

    const agency = await prisma.agence.findUnique({
      where: { id: agenceId },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agence non trouvée' }, { status: 404 });
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil de l\'agence:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil de l\'agence' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Get agenceId from authenticated user session
    const agenceId = 1; // Placeholder for now
    
    const body = await request.json();
    const { name, phone, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de l\'agence est requis' },
        { status: 400 }
      );
    }

    const updatedAgency = await prisma.agence.update({
      where: { id: agenceId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
      },
    });

    return NextResponse.json(updatedAgency);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil de l\'agence:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil de l\'agence' },
      { status: 500 }
    );
  }
}
