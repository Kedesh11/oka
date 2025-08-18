import { reservationRepo, type ReservationFilters } from "@/server/repositories/reservationRepo";
import type { CreateReservationInput } from "@/features/reservations/schemas";
import { prisma } from "@/server/db/prisma";
import type { Requester } from "@/server/auth/requester";

export const reservationService = {
  async list(filters: ReservationFilters = {}) {
    return reservationRepo.findMany(filters);
  },

  async create(input: CreateReservationInput, requester?: Requester) {
    // Ensure the trajet exists to avoid FK error and provide a 400
    const trajet = await prisma.trajet.findUnique({ where: { id: input.trajetId } });
    if (!trajet) {
      const err = new Error("TRAJET_NOT_FOUND");
      throw err;
    }
    // Access guard: if requester is provided and is not Admin/global, enforce agency scope
    if (requester && requester.role !== "Admin") {
      if (!requester.agenceId || trajet.agenceId !== requester.agenceId) {
        const err = new Error("FORBIDDEN");
        (err as any).code = 403;
        throw err;
      }
    }
    return reservationRepo.create(input);
  },
};
