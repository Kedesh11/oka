import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { prisma } from '@/server/db/prisma';

// GET - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        phone: true,
        address: true,
        agenceId: true,
        agence: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, status, phone, address, password } = body;

    // Validation des données
    if (!name || !email || !role || !status || !password) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier que l'agenceId est fourni pour les utilisateurs de type 'Agence'
    if (role === 'Agence' && !body.agenceId) {
      return NextResponse.json(
        { error: 'Un utilisateur de type Agence doit être associé à une agence' },
        { status: 400 }
      );
    }

    // Vérifier que l'agence existe si agenceId est fourni
    if (body.agenceId) {
      const agency = await prisma.agence.findUnique({
        where: { id: body.agenceId },
      });

      if (!agency) {
        return NextResponse.json(
          { error: 'L\'agence sélectionnée n\'existe pas' },
          { status: 400 }
        );
      }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Normaliser le status pour l'enum Prisma ('active' | 'inactive')
    const normalizedStatus = (typeof status === 'string')
      ? (status.toLowerCase() === 'active' ? 'active' : 'inactive')
      : 'inactive';

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        status: normalizedStatus,
        phone: phone || null,
        address: address || null,
        password, // Note: Dans un vrai projet, le mot de passe devrait être hashé
        lastLogin: new Date(),
        agenceId: body.agenceId || null, // Ajouter la relation avec l'agence
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        phone: true,
        address: true,
        agenceId: true,
        agence: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
