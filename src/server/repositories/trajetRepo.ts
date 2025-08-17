import { prisma } from "@/server/db/prisma";
import type { Prisma, StatutTrajet } from "@prisma/client";

export type TrajetFilters = {
  depart?: string;
  arrivee?: string;
  statut?: StatutTrajet;
  agenceId?: number;
};

export const trajetRepo = {
  async findMany(filters: TrajetFilters = {}) {
    const where: Prisma.TrajetWhereInput = {};
    if (filters.depart) where.depart = { contains: filters.depart, mode: "insensitive" };
    if (filters.arrivee) where.arrivee = { contains: filters.arrivee, mode: "insensitive" };
    if (filters.statut) where.statut = filters.statut;
    if (filters.agenceId) where.agenceId = filters.agenceId;
    return prisma.trajet.findMany({ where, orderBy: [{ id: "desc" }] });
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
    return prisma.trajet.create({ data: input });
  },

  async update(id: number, data: Partial<{ depart: string; arrivee: string; heure: string; prixAdulte: number; prixEnfant: number; statut: StatutTrajet; agenceId: number; }>) {
    return prisma.trajet.update({ where: { id }, data });
  },

  async remove(id: number) {
    return prisma.trajet.delete({ where: { id } });
  },
};
