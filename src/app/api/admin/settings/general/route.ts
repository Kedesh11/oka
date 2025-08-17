import { NextRequest, NextResponse } from 'next/server';

// PUT - Mettre à jour les paramètres généraux
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Dans un vrai projet, on sauvegarderait ces paramètres en base de données
    console.log('Paramètres généraux mis à jour:', body);
    
    return NextResponse.json(
      { message: 'Paramètres généraux mis à jour avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres généraux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres généraux' },
      { status: 500 }
    );
  }
}
