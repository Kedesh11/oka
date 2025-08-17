import { TrendingUp, Users2, TicketPercent, HandCoins } from "lucide-react";

export function StatsCards() {
  const items = [
    { label: "Ventes (mois)", value: "--", icon: HandCoins },
    { label: "Réservations (7j)", value: "--", icon: TicketPercent },
    { label: "Clients actifs", value: "--", icon: Users2 },
    { label: "Taux de remplissage", value: "--", icon: TrendingUp },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{label}</div>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}
