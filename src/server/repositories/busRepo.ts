import { prisma } from "@/server/db/prisma";

export type CreateBusInput = {
  agenceId: number;
  name: string;
  type: string;
  seatCount: number;
  seatsPerRow: number;
  layout?: string | null; // optional JSON or text
};

export const busRepo = {
  async listByAgence(agenceId: number) {
    return prisma.bus.findMany({ where: { agenceId }, orderBy: { id: "desc" } });
  },

  async getById(id: number) {
    return prisma.bus.findUnique({ where: { id }, include: { seats: true } });
  },

  async create(input: CreateBusInput) {
    return prisma.bus.create({ data: input });
  },

  async update(id: number, data: Partial<CreateBusInput>) {
    return prisma.bus.update({ where: { id }, data });
  },

  async remove(id: number) {
    await prisma.busSeat.deleteMany({ where: { busId: id } });
    return prisma.bus.delete({ where: { id } });
  },

  async setSeats(
    busId: number,
    seats: { label: string; row: number; col: number; type?: string; isWindow?: boolean; isAisle?: boolean; section?: string | null }[]
  ) {
    // Replace all seats for this bus
    await prisma.$transaction([
      prisma.busSeat.deleteMany({ where: { busId } }),
      prisma.busSeat.createMany({
        data: seats.map((s) => ({
          busId,
          label: s.label,
          row: s.row,
          col: s.col,
          type: (s.type as any) ?? "NORMAL",
          isWindow: Boolean(s.isWindow),
          isAisle: Boolean(s.isAisle),
          section: (s.section as any) ?? null,
        })),
      }),
    ]);
    return prisma.bus.findUnique({ where: { id: busId }, include: { seats: true } });
  },
};
