import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de rapport invalide' },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }

    if (report.status !== 'Généré') {
      return NextResponse.json(
        { error: 'Le rapport n\'est pas encore généré' },
        { status: 400 }
      );
    }

    // Parser le contenu JSON du rapport
    let content = {};
    let summary = {};

    try {
      if (report.content) {
        content = JSON.parse(report.content);
      }
      if (report.summary) {
        summary = JSON.parse(report.summary);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du contenu du rapport:', error);
    }

    // Retourner les données pour la prévisualisation
    return NextResponse.json({
      id: report.id,
      title: report.title,
      type: report.type,
      date: report.createdAt,
      status: report.status,
      content,
      summary,
      url: report.url,
    });
  } catch (error) {
    console.error('Erreur lors de la prévisualisation du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la prévisualisation du rapport' },
      { status: 500 }
    );
  }
}
