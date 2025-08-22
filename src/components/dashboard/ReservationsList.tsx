'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Définir le type pour une réservation, en s'assurant qu'il correspond aux données de l'API
interface Reservation {
  id: number;
  client: string;
  telephone: string;
  nbVoyageurs: number;
  subTotal: number;
  serviceFee: number;
  totalAmount: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  createdAt: string;
  trajet: {
    depart: string;
    arrivee: string;
    agence: {
      name: string;
    };
  };
}

// Formatter la date pour une meilleure lisibilité
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formatter le prix au format monétaire FCFA
const formatPrice = (amount: number) => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

// Choisir la couleur du badge en fonction du statut
const getStatusVariant = (status: Reservation['statut']) => {
  switch (status) {
    case 'confirmee':
      return 'success';
    case 'annulee':
      return 'destructive';
    case 'en_attente':
    default:
      return 'secondary';
  }
};

export default function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reservations');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des réservations');
        }
        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div>Chargement des réservations...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (reservations.length === 0) {
    return <p>Aucune réservation trouvée.</p>;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Trajet</TableHead>
            <TableHead>Agence</TableHead>
            <TableHead className="text-right">Montant Total</TableHead>
            <TableHead className="text-center">Statut</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>
                <div className="font-medium">{reservation.client}</div>
                <div className="text-sm text-muted-foreground">{reservation.telephone}</div>
              </TableCell>
              <TableCell>{`${reservation.trajet.depart} → ${reservation.trajet.arrivee}`}</TableCell>
              <TableCell>{reservation.trajet.agence.name}</TableCell>
              <TableCell className="text-right">{formatPrice(reservation.totalAmount)}</TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusVariant(reservation.statut)} className="capitalize">
                  {reservation.statut.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatDate(reservation.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
