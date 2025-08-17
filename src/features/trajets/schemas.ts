import { z } from "zod";

// Query schema for listing trajets
export const TrajetsQuerySchema = z.object({
  depart: z.string().optional(),
  arrivee: z.string().optional(),
  statut: z.enum(["actif", "inactif"]).optional(),
  agenceId: z.coerce.number().int().optional(),
});

// Payload schema for create/update (placeholders for future Server Actions)
export const TrajetCreateSchema = z.object({
  depart: z.string().min(1),
  arrivee: z.string().min(1),
  heure: z.string().regex(/^\d{2}:\d{2}$/),
  prixAdulte: z.number().int().nonnegative(),
  prixEnfant: z.number().int().nonnegative(),
  statut: z.enum(["actif", "inactif"]).default("actif"),
  agenceId: z.number().int(),
});

export const TrajetUpdateSchema = TrajetCreateSchema.partial();

export type TrajetsQuery = z.infer<typeof TrajetsQuerySchema>;
export type TrajetCreate = z.infer<typeof TrajetCreateSchema>;
export type TrajetUpdate = z.infer<typeof TrajetUpdateSchema>;
