import { prisma } from "@/server/db/prisma";
import { agencyRepo } from "@/server/repositories/agencyRepo";
import type { CreateAgencyInput, UpdateAgencyInput } from "@/features/agencies/schemas";

export const agencyService = {
  async getAll() {
    return agencyRepo.findMany();
  },

  async getById(id: number) {
    return agencyRepo.findById(id);
  },

  async create(data: CreateAgencyInput) {
    const existing = await agencyRepo.findByName(data.name);
    if (existing) {
      throw new Error("AGENCY_NAME_EXISTS");
    }
    return agencyRepo.create(data);
  },

  async update(id: number, data: UpdateAgencyInput) {
    return agencyRepo.update(id, data);
  },

  async delete(id: number, cascade: boolean = true) {
    const agency = await prisma.agence.findUnique({
      where: { id },
      include: { _count: { select: { trajets: true, buses: true } } },
    });

    if (!agency) {
      throw new Error("AGENCY_NOT_FOUND");
    }

    if (cascade) {
      // Utiliser la suppression en cascade
      return agencyRepo.deleteWithCascade(id);
    } else {
      // Vérifier qu'il n'y a pas de relations avant de supprimer
      if (agency._count.trajets > 0 || agency._count.buses > 0) {
        throw new Error("AGENCY_HAS_RELATIONS");
      }
      return agencyRepo.delete(id);
    }
  },
  async findAgenciesByRoute(params: { depart: string; arrivee: string }) {
    const agencies = await agencyRepo.findByRoute(params);
    return agencies;
  },
};
