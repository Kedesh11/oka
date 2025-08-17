import { prisma } from "@/server/db/prisma";
import type { CreateReservationInput } from "@/features/reservations/schemas";
// Local fallback type to avoid hard dependency on generated Prisma enums
type StatutReservationLiteral = "en_attente" | "confirmee" | "annulee";

export type ReservationFilters = {
  trajetId?: number;
  statut?: StatutReservationLiteral;
};

export const reservationRepo = {
  async findMany(filters: ReservationFilters = {}) {
    const where: any = {};
    if (filters.trajetId) where.trajetId = filters.trajetId;
    if (filters.statut) where.statut = filters.statut;

    return prisma.reservation.findMany({ where, orderBy: { id: "desc" } });
  },

  async create(input: CreateReservationInput) {
    return prisma.reservation.create({
      data: input,
    });
  },
};
