import { z } from "zod";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

export const AssignmentSchema = z.object({
  voyageId: z.number().int().positive(),
  busSeatId: z.number().int().positive(),
  passengerId: z.number().int().positive(),
});
export const AssignmentListSchema = z.array(AssignmentSchema);

export type Assignment = z.infer<typeof AssignmentSchema>;

export type SeatPlannerInput = {
  voyageId: number;
  seats: Array<{ id: number; label: string; row: number; col: number; section?: string; isWindow?: boolean; isAisle?: boolean }>;
  takenSeatIds: number[];
  passengers: Array<{ id: number; prefWindow?: boolean | null; prefAisle?: boolean | null; prefSection?: string | null }>;
};

const SYSTEM_PROMPT = `Tu es un planificateur de sièges pour un bus. Retourne UNIQUEMENT du JSON valide.
Contraintes:
- N'assigne JAMAIS un siège déjà occupé (takenSeatIds).
- Un passager AU PLUS une fois.
- Respecte les préférences si possible (fenêtre/aisle/section).
- Ne crée PAS de nouveaux identifiants.
Réponds avec un tableau JSON: [{ "voyageId", "busSeatId", "passengerId" }, ...] et rien d'autre.`;

export async function planSeatsWithLLM(input: SeatPlannerInput, opts?: { model?: string; temperature?: number; baseUrl?: string }) {
  const model = new ChatOllama({
    model: opts?.model || process.env.AI_MODEL || "llama3.1:8b-instruct",
    temperature: typeof opts?.temperature === "number" ? opts!.temperature : Number(process.env.AI_TEMPERATURE ?? 0.1),
    baseUrl: opts?.baseUrl || process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  });

  const payload = {
    voyageId: input.voyageId,
    takenSeatIds: input.takenSeatIds,
    seats: input.seats.map(s => ({ id: s.id, label: s.label, row: s.row, col: s.col, section: s.section, isWindow: s.isWindow, isAisle: s.isAisle })),
    passengers: input.passengers.map(p => ({ id: p.id, prefWindow: p.prefWindow ?? undefined, prefAisle: p.prefAisle ?? undefined, prefSection: p.prefSection ?? undefined })),
  };

  const userPrompt = `Données:\n${JSON.stringify(payload)}\n\nRéponds uniquement avec un tableau JSON d'assignations.`;

  const res = await model.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  const text = typeof res?.content === "string" ? res.content : Array.isArray(res?.content) ? res.content.map((c: any) => c?.text || c).join("") : String(res?.content ?? "");

  // Extraire bloc JSON (compat ES2017, sans flag 's')
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const json = jsonMatch ? jsonMatch[0] : text;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Réponse IA invalide (JSON)");
  }

  const validated = AssignmentListSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("Réponse IA invalide (schéma)");
  }

  // Filtrer par voyageId correct et dédoublonner passagers/sièges
  const seenPassengers = new Set<number>();
  const seenSeats = new Set<number>();
  const result = validated.data.filter(a => {
    if (a.voyageId !== input.voyageId) return false;
    if (seenPassengers.has(a.passengerId)) return false;
    if (seenSeats.has(a.busSeatId)) return false;
    seenPassengers.add(a.passengerId);
    seenSeats.add(a.busSeatId);
    return !input.takenSeatIds.includes(a.busSeatId);
  });

  return result as Assignment[];
}
