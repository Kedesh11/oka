"use client";

import { useEffect, useMemo, useState } from "react";

type Agent = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  createdAt: string;
};

type Props = {
  agencyId: number;
  agencyEmail: string; // email propriétaire de l'agence
  currentUserEmail: string; // email de l'utilisateur connecté
  isAgencyOwner: boolean;
};

export default function AgentsManager({ agencyId, agencyEmail, currentUserEmail, isAgencyOwner }: Props) {
  const canCreate = useMemo(
    () => Boolean(isAgencyOwner),
    [isAgencyOwner]
  );
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/agence/agents?agenceId=${agencyId}`);
      if (!res.ok) throw new Error("Erreur chargement agents");
      const json = await res.json();
      setAgents(json.items || []);
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (agencyId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch(`/api/agence/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Les en-têtes d'identité sont ajoutés par votre middleware côté serveur.
        },
        body: JSON.stringify({ ...form, agenceId: agencyId }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.error || "Échec de création";
        throw new Error(msg);
      }
      if (json.warning) {
        const parts = [json.warning];
        if (json.tempPassword) parts.push(`Mot de passe provisoire (dev): ${json.tempPassword}`);
        setCreateMsg(parts.join(" "));
      } else {
        const parts = ["Agent créé et email envoyé."];
        if (json.tempPassword) parts.push(`Mot de passe provisoire (dev): ${json.tempPassword}`);
        setCreateMsg(parts.join(" "));
      }
      setForm({ name: "", email: "", phone: "" });
      setOpenForm(false);
      await load();
    } catch (e: any) {
      setCreateMsg(e.message || "Erreur inconnue");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agents de l'agence</h2>
        {canCreate ? (
          <button
            onClick={() => setOpenForm(true)}
            className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
          >
            + Créer un agent
          </button>
        ) : null}
      </div>

      {loading ? <div>Chargement…</div> : null}
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}

      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Nom</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Téléphone</th>
              <th className="text-left px-3 py-2">Statut</th>
              <th className="text-left px-3 py-2">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2">{a.email}</td>
                <td className="px-3 py-2">{a.phone || "—"}</td>
                <td className="px-3 py-2">{a.status}</td>
                <td className="px-3 py-2">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {agents.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  Aucun agent pour l'instant
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {openForm && canCreate ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-4 py-3 border-b font-medium">Créer un agent</div>
            <form onSubmit={onCreate} className="p-4 space-y-3">
              <div>
                <label className="block text-sm mb-1">Nom</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Téléphone (optionnel)</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              {createMsg ? (
                <div
                  className={`text-sm ${createMsg?.startsWith('Agent créé') || createMsg?.startsWith("Utilisateur créé") ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {createMsg}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded-md border"
                  onClick={() => setOpenForm(false)}
                  disabled={creating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  disabled={creating}
                >
                  {creating ? "Création…" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
