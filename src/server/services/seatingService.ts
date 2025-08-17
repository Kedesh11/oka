import { prisma } from "@/server/db/prisma";

export type AutoAssignOptions = {
  voyageId: number;
};

export type AssignmentResult = {
  assigned: number; // passengers assigned
  total: number;
  reroutedFamilies: { reservationId: number; size: number }[];
  notes?: string[];
};

// Helper to build seat grid and contiguity search
function buildGrid(seats: { id: number; row: number; col: number }[]) {
  const byRow = new Map<number, { id: number; row: number; col: number }[]>();
  seats.forEach((s) => {
    const arr = byRow.get(s.row) ?? [];
    arr.push(s);
    byRow.set(s.row, arr);
  });
  // sort by col per row
  for (const arr of byRow.values()) arr.sort((a, b) => a.col - b.col);
  return byRow;
}

function findContiguousBlock(
  grid: Map<number, { id: number; row: number; col: number }[]>,
  takenSeatIds: Set<number>,
  size: number
): { row: number; seatIds: number[] } | null {
  for (const [row, arr] of grid.entries()) {
    let streak: number[] = [];
    for (const s of arr) {
      if (!takenSeatIds.has(s.id)) {
        streak.push(s.id);
        if (streak.length === size) {
          return { row, seatIds: [...streak] };
        }
      } else {
        streak = [];
      }
    }
  }
  return null;
}

export const seatingService = {
  // Compute/refresh passengers rows for a reservation (one row per traveller)
  async expandReservationPassengers(reservationId: number) {
    const res = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!res) return;
    const count = res.nbVoyageurs;
    const existing = await prisma.reservationPassenger.count({ where: { reservationId } });
    if (existing !== count) {
      await prisma.$transaction(async (tx) => {
        await tx.reservationPassenger.deleteMany({ where: { reservationId } });
        await tx.reservationPassenger.createMany({
          data: Array.from({ length: count }).map(() => ({ reservationId })),
        });
      });
    }
  },

  async autoAssign(options: AutoAssignOptions): Promise<AssignmentResult> {
    const voyage = await prisma.voyage.findUnique({
      where: { id: options.voyageId },
      include: {
        bus: { include: { seats: true } },
        assignments: true,
        trajet: true,
      },
    });
    if (!voyage) throw new Error("Voyage introuvable");

    const grid = buildGrid(
      voyage.bus.seats.map((s: { id: number; row: number; col: number }) => ({ id: s.id, row: s.row, col: s.col }))
    );
    const taken = new Set<number>(voyage.assignments.map((a: { busSeatId: number }) => a.busSeatId));

    // Fetch reservations linked to this voyage and expand passengers
    const reservations = await prisma.reservation.findMany({ where: { voyageId: voyage.id } });
    for (const r of reservations) await this.expandReservationPassengers(r.id);

    // Load passengers and existing assignments
    const passengers = await prisma.reservationPassenger.findMany({
      where: { reservationId: { in: reservations.map((r) => r.id) } },
      include: { reservation: true },
    });

    // Group by reservation (families)
    const families = new Map<number, { reservationId: number; size: number; passengerIds: number[] }>();
    for (const p of passengers) {
      const entry = families.get(p.reservationId) ?? { reservationId: p.reservationId, size: 0, passengerIds: [] };
      entry.size += 1;
      entry.passengerIds.push(p.id);
      families.set(p.reservationId, entry);
    }
    // Sort families by descending size to place big groups first
    const groups = Array.from(families.values()).sort((a, b) => b.size - a.size);

    // Track which passengers are already assigned
    const alreadyAssigned = new Set<number>(
      (await prisma.seatAssignment.findMany({ where: { voyageId: voyage.id } })).map((a) => a.passengerId)
    );

    let assignedCount = 0;
    const rerouted: { reservationId: number; size: number }[] = [];
    const notes: string[] = [];

    // Try simple greedy contiguous assignment
    for (const g of groups) {
      const unassignedPassengerIds = g.passengerIds.filter((pid) => !alreadyAssigned.has(pid));
      if (unassignedPassengerIds.length === 0) continue;
      const block = findContiguousBlock(grid, taken, unassignedPassengerIds.length);
      if (block) {
        // Assign passengers to the contiguous block
        const toAssign = unassignedPassengerIds.slice(0, block.seatIds.length);
        await prisma.$transaction(
          toAssign.map((pid: number, idx: number) =>
            prisma.seatAssignment.create({
              data: {
                voyageId: voyage.id,
                busSeatId: block.seatIds[idx],
                passengerId: pid,
              },
            })
          )
        );
        toAssign.forEach((_, idx) => taken.add(block.seatIds[idx]));
        toAssign.forEach((pid) => alreadyAssigned.add(pid));
        assignedCount += toAssign.length;
        continue;
      }

      // Attempt light rebalancing: try to free seats in the same row by moving single seats to other free spots
      let rebalanced = false;
      for (const [row, arr] of grid.entries()) {
        // seats in this row not taken
        const freeInRow = arr.filter((s) => !taken.has(s.id));
        if (freeInRow.length >= unassignedPassengerIds.length) {
          // Move some existing assignments from this row to other free seats
          const needed = unassignedPassengerIds.length - freeInRow.length;
          if (needed > 0) {
            // find other free seats outside this row
            const otherFree: number[] = [];
            for (const [r2, arr2] of grid.entries()) {
              if (r2 === row) continue;
              for (const s2 of arr2) if (!taken.has(s2.id)) otherFree.push(s2.id);
            }
            if (otherFree.length >= needed) {
              // Move 'needed' assignments out of this row
              const currentAssignments = await prisma.seatAssignment.findMany({
                where: { voyageId: voyage.id, busSeatId: { in: arr.map((s) => s.id) } },
                orderBy: { id: "asc" },
              });
              const toMove = currentAssignments.slice(0, needed);
              await prisma.$transaction(
                toMove.map((a: { id: number; busSeatId: number }, idx: number) =>
                  prisma.seatAssignment.update({ where: { id: a.id }, data: { busSeatId: otherFree[idx] } })
                )
              );
              // Update taken seats
              toMove.forEach((a) => {
                taken.delete(a.busSeatId);
              });
              for (let i = 0; i < needed; i++) taken.add(otherFree[i]);
              rebalanced = true;
            }
          } else {
            rebalanced = true;
          }
        }
        if (rebalanced) {
          // Now seats in row should be enough contiguously
          const block2 = findContiguousBlock(grid, taken, unassignedPassengerIds.length);
          if (block2) {
            const toAssign = unassignedPassengerIds.slice(0, block2.seatIds.length);
            await prisma.$transaction(
              toAssign.map((pid: number, idx: number) =>
                prisma.seatAssignment.create({
                  data: { voyageId: voyage.id, busSeatId: block2.seatIds[idx], passengerId: pid },
                })
              )
            );
            toAssign.forEach((_, idx) => taken.add(block2.seatIds[idx]));
            toAssign.forEach((pid) => alreadyAssigned.add(pid));
            assignedCount += toAssign.length;
          }
          break;
        }
      }

      if (!rebalanced) {
        // Could not place this family -> mark for rerouting
        rerouted.push({ reservationId: g.reservationId, size: unassignedPassengerIds.length });
      }
    }

    return { assigned: assignedCount, total: passengers.length, reroutedFamilies: rerouted, notes };
  },
};
