export function ReservationsTable() {
  // Placeholder table for recent reservations
  const rows = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    trajet: "Trajet "+(i+1),
    client: "Client "+(i+1),
    statut: "en_attente",
  }));
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4 text-sm text-muted-foreground">Réservations récentes</div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Trajet</th>
              <th className="py-2 pr-4">Client</th>
              <th className="py-2 pr-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{r.id}</td>
                <td className="py-2 pr-4">{r.trajet}</td>
                <td className="py-2 pr-4">{r.client}</td>
                <td className="py-2 pr-4">
                  <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs">{r.statut}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
