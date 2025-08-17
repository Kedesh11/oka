import { z } from "zod";

export const agenciesByRouteQuerySchema = z.object({
  depart: z.string().min(2).max(100),
  arrivee: z.string().min(2).max(100),
});

export type AgenciesByRouteQuery = z.infer<typeof agenciesByRouteQuerySchema>;

export const AgencySchema = z.object({
  id: z.number().int(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email n'est pas valide").nullable(),
  phone: z.string().min(5, "Le téléphone doit contenir au moins 5 caractères").nullable(),
  address: z.string().nullable(),
  zone: z.string().nullable(),
});

export const CreateAgencySchema = AgencySchema.omit({ id: true });
export const UpdateAgencySchema = CreateAgencySchema.partial();

export type Agency = z.infer<typeof AgencySchema>;
export type CreateAgencyInput = z.infer<typeof CreateAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof UpdateAgencySchema>;
