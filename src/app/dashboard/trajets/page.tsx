import { createTrajet, updateTrajet, deleteTrajet } from "@/features/trajets/actions";
import { trajetService } from "@/server/services/trajetService";
import TrajetsTableClient from "@/components/dashboard/trajets/TrajetsTableClient";

export default async function TrajetsPage() {
  // Server Component: fetch trajets from DB (local Supabase in dev)
  let trajets: Awaited<ReturnType<typeof trajetService.list>> = [] as any;
  let loadError: string | undefined;
  try {
    trajets = await trajetService.list();
  } catch (e) {
    console.error("Failed to load trajets:", e);
    loadError =
      "La base de données est indisponible pour le moment. Vérifiez la configuration ou réessayez plus tard.";
  }

  // Inline server actions for form bindings
  async function handleCreate(formData: FormData) {
    "use server";
    await createTrajet(formData);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;
    await deleteTrajet(id);
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return;
    await updateTrajet(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Trajets</h1>
      {loadError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : (
        <TrajetsTableClient trajets={trajets as any} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}
    </div>
  );
}
