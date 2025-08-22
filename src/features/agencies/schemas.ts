import { z } from "zod";

export const agenciesByRouteQuerySchema = z.object({
  depart: z.string().min(2).max(100),
  arrivee: z.string().min(2).max(100),
});

export type AgenciesByRouteQuery = z.infer<typeof agenciesByRouteQuerySchema>;

export const AgencySchema = z.object({
  id: z.number().int(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email n'est pas valide").optional().or(z.literal("")).transform(val => val === "" ? null : val),
  phone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  address: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val),
  zone: z.string().optional().or(z.literal("")).transform(val => val === "" ? null : val),
}).strict();

export const CreateAgencySchema = AgencySchema.omit({ id: true });
export const UpdateAgencySchema = CreateAgencySchema.partial();

export type Agency = z.infer<typeof AgencySchema>;
export type CreateAgencyInput = z.infer<typeof CreateAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof UpdateAgencySchema>;
