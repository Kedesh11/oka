'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { trajetService } from '@/server/services/trajetService'
import { TrajetCreateSchema, TrajetUpdateSchema } from '@/features/trajets/schemas'

export async function createTrajet(formData: FormData) {
  const input = Object.fromEntries(formData) as Record<string, string>
  const parsed = TrajetCreateSchema.safeParse({
    depart: input.depart,
    arrivee: input.arrivee,
    heure: input.heure,
    prixAdulte: Number(input.prixAdulte),
    prixEnfant: Number(input.prixEnfant),
    statut: (input.statut as any) ?? 'actif',
    agenceId: Number(input.agenceId),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() }
  }

  await trajetService.create(parsed.data)
  revalidateTag('trajets')
  revalidatePath('/dashboard/trajets')
  return { ok: true }
}

export async function updateTrajet(id: number, formData: FormData) {
  const input = Object.fromEntries(formData) as Record<string, string>
  const parsed = TrajetUpdateSchema.safeParse({
    depart: input.depart,
    arrivee: input.arrivee,
    heure: input.heure,
    prixAdulte: input.prixAdulte ? Number(input.prixAdulte) : undefined,
    prixEnfant: input.prixEnfant ? Number(input.prixEnfant) : undefined,
    statut: (input.statut as any) ?? undefined,
    agenceId: input.agenceId ? Number(input.agenceId) : undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() }
  }

  await trajetService.update(id, parsed.data)
  revalidateTag('trajets')
  revalidatePath('/dashboard/trajets')
  return { ok: true }
}

export async function deleteTrajet(id: number) {
  await trajetService.remove(id)
  revalidateTag('trajets')
  revalidatePath('/dashboard/trajets')
  return { ok: true }
}
