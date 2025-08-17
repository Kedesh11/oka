"use server";

import { revalidatePath } from "next/cache";
import { busRepo, type CreateBusInput } from "@/server/repositories/busRepo";
import { voyageRepo } from "@/server/repositories/voyageRepo";
import { seatingService } from "@/server/services/seatingService";

export async function listBuses(agenceId: number) {
  return busRepo.listByAgence(agenceId);
}

export async function createBus(input: CreateBusInput) {
  const bus = await busRepo.create(input);
  revalidatePath("/dashboard");
  return bus;
}

export async function updateBus(id: number, data: Partial<CreateBusInput>) {
  const bus = await busRepo.update(id, data);
  revalidatePath("/dashboard");
  return bus;
}

export async function removeBus(id: number) {
  await busRepo.remove(id);
  revalidatePath("/dashboard");
}

export async function setBusSeats(
  busId: number,
  seats: { label: string; row: number; col: number }[]
) {
  const bus = await busRepo.setSeats(busId, seats);
  revalidatePath("/dashboard");
  return bus;
}

export async function createVoyage(params: { trajetId: number; busId: number; date: string }) {
  const date = new Date(params.date);
  const voyage = await voyageRepo.create({ trajetId: params.trajetId, busId: params.busId, date });
  revalidatePath("/dashboard");
  return voyage;
}

export async function getVoyage(voyageId: number) {
  return voyageRepo.getById(voyageId);
}

export async function getVoyageOccupancy(voyageId: number) {
  return voyageRepo.occupancy(voyageId);
}

export async function autoAssignVoyage(voyageId: number) {
  const res = await seatingService.autoAssign({ voyageId });
  revalidatePath("/dashboard");
  return res;
}
