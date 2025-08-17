import { z } from "zod";

export const ReservationsQuerySchema = z.object({
  trajetId: z.coerce.number().int().optional(),
  // Updated enum variants to match Prisma (no accents)
  statut: z.enum(["en_attente", "confirmee", "annulee"]).optional(),
});

export type ReservationsQuery = z.infer<typeof ReservationsQuerySchema>;

export const CreateReservationSchema = z.object({
  trajetId: z.number().int(),
  client: z.string().min(2).max(120),
  telephone: z.string().min(5).max(30),
  nbVoyageurs: z.number().int().min(1).max(100),
  childrenCount: z.number().int().min(0).optional(),
  baggage: z.number().int().min(0).optional(),
  adultIdUrl: z.string().url().optional(),
  otherDocumentUrl: z.string().url().optional(),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
