import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer les logs de sécurité
export async function GET() {
  try {
    // Pour l'instant, retournons des données simulées
    // Dans un vrai projet, ces logs seraient stockés en base de données
    const securityLogs = [
      {
        id: 1,
        action: 'Connexion réussie',
        user: 'admin@oka.com',
        ip: '192.168.1.1',
        time: '2024-01-15 10:30',
        status: 'success'
      },
      {
        id: 2,
        action: 'Tentative de connexion échouée',
        user: 'unknown@example.com',
        ip: '192.168.1.2',
        time: '2024-01-15 09:15',
        status: 'error'
      },
      {
        id: 3,
        action: 'Modification de mot de passe',
        user: 'user@oka.com',
        ip: '192.168.1.3',
        time: '2024-01-15 08:45',
        status: 'warning'
      },
      {
        id: 4,
        action: 'Nouvel utilisateur créé',
        user: 'admin@oka.com',
        ip: '192.168.1.1',
        time: '2024-01-15 08:30',
        status: 'success'
      },
      {
        id: 5,
        action: 'Suppression d\'utilisateur',
        user: 'admin@oka.com',
        ip: '192.168.1.1',
        time: '2024-01-15 08:00',
        status: 'warning'
      }
    ];

    return NextResponse.json(securityLogs);
  } catch (error) {
    console.error('Erreur lors de la récupération des logs de sécurité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs de sécurité' },
      { status: 500 }
    );
  }
}
