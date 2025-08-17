import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";
import type { CreateAgencyInput, UpdateAgencyInput } from "@/features/agencies/schemas";

export const agencyRepo = {
  async findMany() {
    return prisma.agence.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            trajets: true,
            buses: true,
          },
        },
      },
    });
  },

  async findById(id: number) {
    return prisma.agence.findUnique({ where: { id } });
  },

  async findByName(name: string) {
    return prisma.agence.findFirst({ where: { name } });
  },
  async create(data: CreateAgencyInput) {
    return prisma.agence.create({ data });
  },

  async update(id: number, data: UpdateAgencyInput) {
    return prisma.agence.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.agence.delete({ where: { id } });
  },

  async findByRoute(params: { depart: string; arrivee: string }) {
    const { depart, arrivee } = params;
    return prisma.agence.findMany({
      where: {
        trajets: {
          some: {
            depart: { contains: depart, mode: "insensitive" },
            arrivee: { contains: arrivee, mode: "insensitive" },
          },
        },
      } as Prisma.AgenceWhereInput,
      include: {
        trajets: {
          where: {
            depart: { contains: depart, mode: "insensitive" },
            arrivee: { contains: arrivee, mode: "insensitive" },
          },
          orderBy: { id: "desc" },
          take: 20,
        },
      },
      orderBy: { id: "asc" },
      take: 50,
    });
  },
};
