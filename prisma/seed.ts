import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer des agences de test (garanti non null via upsert)
  const agence1 = await prisma.agence.upsert({
    where: { email: 'contact@transport-libreville.ga' },
    update: {},
    create: {
      name: 'Transport Libreville',
      email: 'contact@transport-libreville.ga',
      phone: '+241 01 23 45 67',
      address: '123 Avenue de la Paix, Libreville',
      zone: 'Libreville',
    },
  });

  const agence2 = await prisma.agence.upsert({
    where: { email: 'info@voyages-portgentil.ga' },
    update: {},
    create: {
      name: 'Voyages Port-Gentil',
      email: 'info@voyages-portgentil.ga',
      phone: '+241 02 34 56 78',
      address: '456 Boulevard Maritime, Port-Gentil',
      zone: 'Port-Gentil',
    },
  });

  const agence3 = await prisma.agence.upsert({
    where: { email: 'contact@express-oyem.ga' },
    update: {},
    create: {
      name: 'Express Oyem',
      email: 'contact@express-oyem.ga',
      phone: '+241 03 45 67 89',
      address: '789 Route Nationale, Oyem',
      zone: 'Oyem',
    },
  });

  console.log('✅ Agences créées:', { agence1: agence1.name, agence2: agence2.name, agence3: agence3.name });

  // Créer des trajets de test
  const trajet1 = await prisma.trajet.create({
    data: {
      depart: 'Libreville',
      arrivee: 'Port-Gentil',
      heure: '08:00',
      prixAdulte: 15000,
      prixEnfant: 7500,
      agenceId: agence1.id
    }
  });

  const trajet2 = await prisma.trajet.create({
    data: {
      depart: 'Libreville',
      arrivee: 'Oyem',
      heure: '07:30',
      prixAdulte: 12000,
      prixEnfant: 6000,
      agenceId: agence1.id
    }
  });

  const trajet3 = await prisma.trajet.create({
    data: {
      depart: 'Port-Gentil',
      arrivee: 'Libreville',
      heure: '16:00',
      prixAdulte: 15000,
      prixEnfant: 7500,
      agenceId: agence2.id
    }
  });

  console.log('✅ Trajets créés:', { 
    trajet1: `${trajet1.depart} → ${trajet1.arrivee}`,
    trajet2: `${trajet2.depart} → ${trajet2.arrivee}`,
    trajet3: `${trajet3.depart} → ${trajet3.arrivee}`
  });

  // Créer des bus de test
  const bus1 = await prisma.bus.create({
    data: {
      name: 'Bus-001',
      type: 'Coaster',
      seatCount: 25,
      seatsPerRow: 4,
      layout: '2+2',
      agenceId: agence1.id
    }
  });

  const bus2 = await prisma.bus.create({
    data: {
      name: 'Bus-002',
      type: 'Hiace',
      seatCount: 18,
      seatsPerRow: 3,
      layout: '2+1',
      agenceId: agence2.id
    }
  });

  console.log('✅ Bus créés:', { bus1: bus1.name, bus2: bus2.name });

  // Créer des localités de base (unique sur le nom)
  const localites = [
    'Libreville',
    'Port-Gentil',
    'Oyem',
    'Franceville',
    'Lambaréné',
    'Mouila',
    'Bitam',
  ];
  // SQLite ne supporte pas skipDuplicates typé -> on itère en upsert-like
  for (const name of localites) {
    try {
      await prisma.localite.create({ data: { name } });
    } catch {
      // ignore duplicate
    }
  }
  console.log('✅ Localités insérées');

  // Créer des utilisateurs de test
  const userData: Array<{ name: string; email: string; role: UserRole; status: UserStatus }> = [
    { name: 'Admin Principal', email: 'admin@oka.com', role: UserRole.Admin, status: UserStatus.active },
    { name: 'Marie Martin', email: 'marie@agence.com', role: UserRole.Agence, status: UserStatus.active },
    { name: 'Pierre Durand', email: 'pierre@client.com', role: UserRole.Client, status: UserStatus.active },
    { name: 'Jean Dupont', email: 'jean@example.com', role: UserRole.Client, status: UserStatus.inactive },
    { name: 'Sophie Bernard', email: 'sophie@agence.com', role: UserRole.Agence, status: UserStatus.active },
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);
  for (const userInfo of userData) {
    try {
      await prisma.user.create({
        data: {
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
          status: userInfo.status,
          password: hashedPassword, // Mot de passe hashé
          phone: `+241 0123456${Math.floor(Math.random() * 9)}`,
          address: `Adresse ${Math.floor(Math.random() * 100)}`,
          lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Dernière connexion dans les 7 derniers jours
        },
      });
    } catch (error) {
      console.log(`Utilisateur ${userInfo.email} existe déjà`);
    }
  }

  console.log('✅ Utilisateurs créés');

  // Créer des réservations de test
  const reservation1 = await prisma.reservation.create({
    data: {
      trajetId: trajet1.id,
      client: 'Jean Dupont',
      telephone: '+241 01 11 11 11',
      nbVoyageurs: 2,
      childrenCount: 1,
      baggage: 2
    }
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      trajetId: trajet2.id,
      client: 'Marie Martin',
      telephone: '+241 02 22 22 22',
      nbVoyageurs: 1,
      childrenCount: 0,
      baggage: 1
    }
  });

  console.log('✅ Réservations créées:', { 
    reservation1: reservation1.client,
    reservation2: reservation2.client
  });

  console.log('🎉 Base de données seedée avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
