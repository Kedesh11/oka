import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";
import type { CreateAgencyInput, UpdateAgencyInput } from "@/features/agencies/schemas";

export const agencyRepo = {
  async findMany() {
    return prisma.agence.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        zone: true,
        createdAt: true,
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
    return prisma.agence.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        zone: true,
        createdAt: true,
      },
    });
  },

  async findByName(name: string) {
    // Only select id to check existence, avoiding selecting any legacy columns
    return prisma.agence.findFirst({
      where: { name },
      select: { id: true },
    });
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

  async deleteWithCascade(id: number) {
    return prisma.$transaction(async (tx) => {
      // 1. Supprimer toutes les assignations de sièges liées aux voyages de cette agence
      await tx.seatAssignment.deleteMany({
        where: {
          voyage: {
            bus: {
              agenceId: id
            }
          }
        }
      });

      // 2. Supprimer tous les passagers de réservation liés aux réservations de cette agence
      await tx.reservationPassenger.deleteMany({
        where: {
          reservation: {
            trajet: {
              agenceId: id
            }
          }
        }
      });

      // 3. Supprimer toutes les réservations liées aux trajets de cette agence
      await tx.reservation.deleteMany({
        where: {
          trajet: {
            agenceId: id
          }
        }
      });

      // 4. Supprimer tous les voyages liés aux trajets de cette agence
      await tx.voyage.deleteMany({
        where: {
          trajet: {
            agenceId: id
          }
        }
      });

      // 5. Supprimer tous les sièges de bus liés aux bus de cette agence
      await tx.busSeat.deleteMany({
        where: {
          bus: {
            agenceId: id
          }
        }
      });

      // 6. Supprimer tous les trajets de cette agence
      await tx.trajet.deleteMany({
        where: {
          agenceId: id
        }
      });

      // 7. Supprimer tous les bus de cette agence
      await tx.bus.deleteMany({
        where: {
          agenceId: id
        }
      });

      // 8. Supprimer tous les utilisateurs associés à cette agence
      await tx.user.updateMany({
        where: {
          agenceId: id
        },
        data: {
          agenceId: null
        }
      });

      // 9. Enfin, supprimer l'agence elle-même
      return tx.agence.delete({
        where: { id }
      });
    });
  },

  async findByRoute(params: { depart: string; arrivee: string }) {
    const { depart, arrivee } = params;
          return prisma.agence.findMany({
        where: {
          trajets: {
            some: {
              depart: { contains: depart },
              arrivee: { contains: arrivee },
            },
          },
        } as Prisma.AgenceWhereInput,
        include: {
          trajets: {
            where: {
              depart: { contains: depart },
              arrivee: { contains: arrivee },
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
