import { reservationRepo, type ReservationFilters } from "@/server/repositories/reservationRepo";
import type { CreateReservationInput } from "@/features/reservations/schemas";
import { prisma } from "@/server/db/prisma";

export const reservationService = {
  async list(filters: ReservationFilters = {}) {
    return reservationRepo.findMany(filters);
  },

  async create(input: CreateReservationInput) {
    // Ensure the trajet exists to avoid FK error and provide a 400
    const trajet = await prisma.trajet.findUnique({ where: { id: input.trajetId } });
    if (!trajet) {
      const err = new Error("TRAJET_NOT_FOUND");
      throw err;
    }
    return reservationRepo.create(input);
  },
};
