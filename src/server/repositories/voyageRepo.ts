import { prisma } from "@/server/db/prisma";

export const voyageRepo = {
  async create(params: { trajetId: number; busId: number; date: Date }) {
    return prisma.voyage.create({ data: params });
  },

  async getById(id: number) {
    return prisma.voyage.findUnique({
      where: { id },
      include: {
        bus: { include: { seats: true } },
        trajet: true,
        assignments: { include: { busSeat: true, passenger: { include: { reservation: true } } } },
      },
    });
  },

  async listByTrajetDate(trajetId: number, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return prisma.voyage.findMany({
      where: { trajetId, date: { gte: start, lt: end } },
      orderBy: { id: "desc" },
      include: { bus: true },
    });
  },

  async occupancy(voyageId: number) {
    const [totalSeats, taken] = await Promise.all([
      prisma.busSeat.count({ where: { bus: { voyages: { some: { id: voyageId } } } } }),
      prisma.seatAssignment.count({ where: { voyageId } }),
    ]);
    return { totalSeats, taken, free: totalSeats - taken, percent: totalSeats ? taken / totalSeats : 0 };
  },
};
