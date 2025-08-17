"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Route, TicketPercent, LineChart, HandCoins, LifeBuoy } from "lucide-react";

const nav = [
  { href: "/dashboard/agence?tab=overview", label: "Accueil", icon: LayoutGrid },
  { href: "/dashboard/agence?tab=fleet", label: "Flotte", icon: LayoutGrid },
  { href: "/dashboard/agence?tab=voyages", label: "Voyages", icon: Route },
  { href: "/dashboard/agence?tab=routes", label: "Trajets", icon: Route },
  { href: "/dashboard/agence?tab=bookings", label: "Réservations", icon: TicketPercent },
  { href: "/dashboard/agence?tab=settings", label: "Revenus", icon: HandCoins },
  { href: "/dashboard/agence?tab=overview", label: "Statistiques", icon: LineChart },
  { href: "/dashboard/agence?tab=settings", label: "Support", icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <aside className="flex w-60 md:w-64 lg:w-72 xl:w-80 border-r border-border bg-card/50 backdrop-blur">
      <div className="flex h-screen flex-col gap-2 p-4">
        <div className="px-2 py-3 text-xl font-semibold">Oka Voyage</div>
        <nav className="flex-1 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            // Determine active state considering the `tab` query param when applicable
            const url = new URL(href, "http://localhost");
            const hrefPath = url.pathname;
            const hrefTab = url.searchParams.get("tab");
            const currentTab = searchParams.get("tab");
            const active =
              pathname === hrefPath && (hrefTab ? currentTab === hrefTab : true);
            return (
              <Link key={`${href}-${label}`} href={href} className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="text-xs text-muted-foreground px-2">© {new Date().getFullYear()} Oka</div>
      </div>
    </aside>
  );
}
