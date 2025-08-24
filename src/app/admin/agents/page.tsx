"use client";

import { useEffect, useMemo, useState } from "react";

type Agency = {
  id: number;
  name: string;
  email?: string | null;
};

export default function AdminAgentsPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", agenceId: 0 });
  const canSubmit = useMemo(() => form.name && form.email && form.agenceId > 0, [form]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tempPwdDev, setTempPwdDev] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgencies() {
      try {
        setLoadingAgencies(true);
        const res = await fetch("/api/admin/agencies");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Erreur chargement agences");
        const items = Array.isArray(json) ? json : json.items || [];
        setAgencies(items.map((a: any) => ({ id: a.id, name: a.name, email: a.email })));
      } catch (e: any) {
        setError(e.message || "Erreur inconnue");
      } finally {
        setLoadingAgencies(false);
      }
    }
    loadAgencies();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          agenceId: Number(form.agenceId),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.error || "Échec de création";
        throw new Error(msg);
      }
      const parts = ["Agent créé avec succès."];
      if (json.warning) parts.push(json.warning);
      if (json.tempPassword) {
        setTempPwdDev(json.tempPassword as string);
        parts.push(`Mot de passe provisoire (dev) disponible ci-dessous.`);
      } else {
        setTempPwdDev(null);
      }
      setMessage(parts.join(" "));
      setForm({ name: "", email: "", phone: "", agenceId: 0 });
    } catch (e: any) {
      setMessage(e.message || "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Créer un agent (Admin)</h1>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <form onSubmit={onSubmit} className="space-y-4 border rounded-md p-4">
        <div>
          <label className="block text-sm mb-1">Agence</label>
          <select
            value={form.agenceId}
            onChange={(e) => setForm((f) => ({ ...f, agenceId: Number(e.target.value) }))}
            className="w-full border rounded-md px-3 py-2 text-sm"
            disabled={loadingAgencies}
            required
          >
            <option value={0} disabled>
              {loadingAgencies ? "Chargement…" : "Sélectionner une agence"}
            </option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.email ? `(${a.email})` : ""}
              </option>
            ))}
          </select>
        </div>

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

        {message ? (
          <div className="space-y-2">
            <div className="text-sm">{message}</div>
            {tempPwdDev ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Mot de passe provisoire (dev):</span>
                <code className="px-2 py-1 bg-slate-100 rounded">{tempPwdDev}</code>
                <button
                  type="button"
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(tempPwdDev!); } catch {}
                  }}
                  className="px-2 py-1 border rounded hover:bg-slate-50"
                >
                  Copier
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="submit" className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60" disabled={!canSubmit || submitting}>
            {submitting ? "Création…" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}
