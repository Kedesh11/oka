export interface Bus {
  id: number;
  name: string;
  type?: string;
  seatCount?: number;
  seatsPerRow?: number;
}

export interface Trajet {
  id: number;
  depart: string;
  arrivee: string;
  heure: string; // HH:mm
  prixAdulte?: number;
  prixEnfant?: number;
}

export interface Voyage {
  id: number;
  date: string; // ISO
  trajetId: number;
  busId: number;
  trajet?: Trajet;
  bus?: Bus;
}

export interface Occupancy {
  totalSeats: number;
  taken: number;
  free: number;
  percent: number; // 0..1
}
