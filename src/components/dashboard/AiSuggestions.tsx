export function AiSuggestions() {
  const suggestions = [
    "Ajuster le prix du trajet Kinshasa → Goma (+5%).",
    "Promouvoir les départs du mardi, faible remplissage.",
    "Offrir -10% aux nouveaux clients pour booster l'acquisition.",
  ];
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 text-sm text-muted-foreground">Suggestions IA</div>
      <ul className="space-y-2 text-sm">
        {suggestions.map((s, i) => (
          <li key={i} className="rounded-md border p-3">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
