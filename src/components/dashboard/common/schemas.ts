import { z } from "zod";

export const BusSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
  seatCount: z.number().int().nonnegative().optional(),
  seatsPerRow: z.number().int().positive().max(6).optional(),
});

export const TrajetSchema = z.object({
  id: z.number(),
  depart: z.string(),
  arrivee: z.string(),
  heure: z.string(), // HH:mm
  prixAdulte: z.number().optional(),
  prixEnfant: z.number().optional(),
});

export const VoyageSchema = z.object({
  id: z.number(),
  date: z.string(), // ISO
  trajetId: z.number(),
  busId: z.number(),
  trajet: TrajetSchema.optional(),
  bus: BusSchema.optional(),
});

export const OccupancySchema = z.object({
  totalSeats: z.number().int().nonnegative(),
  taken: z.number().int().nonnegative(),
  free: z.number().int().nonnegative(),
  percent: z.number().min(0).max(1),
});

export const ListResponse = <T extends z.ZodTypeAny>(item: T) => z.object({ items: z.array(item) });

export type BusParsed = z.infer<typeof BusSchema>;
export type TrajetParsed = z.infer<typeof TrajetSchema>;
export type VoyageParsed = z.infer<typeof VoyageSchema>;
export type OccupancyParsed = z.infer<typeof OccupancySchema>;
