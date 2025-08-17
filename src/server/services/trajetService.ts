import type { StatutTrajet } from "@prisma/client";
import { trajetRepo, type TrajetFilters } from "@/server/repositories/trajetRepo";

export const trajetService = {
  async list(filters: TrajetFilters = {}) {
    return trajetRepo.findMany(filters);
  },

  async create(input: {
    depart: string;
    arrivee: string;
    heure: string;
    prixAdulte: number;
    prixEnfant: number;
    statut?: StatutTrajet;
    agenceId: number;
  }) {
    // Place to add business rules (e.g., validation, pricing normalization)
    return trajetRepo.create(input);
  },

  async update(id: number, data: Partial<{ depart: string; arrivee: string; heure: string; prixAdulte: number; prixEnfant: number; statut: StatutTrajet; agenceId: number }>) {
    return trajetRepo.update(id, data);
  },

  async remove(id: number) {
    return trajetRepo.remove(id);
  },
};
