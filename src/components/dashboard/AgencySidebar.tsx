"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LayoutGrid, Route, TicketPercent, LineChart, HandCoins, LifeBuoy, LogOut } from "lucide-react";

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

export function AgencySidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <aside className="flex w-60 md:w-64 lg:w-72 xl:w-72 border-r bg-white h-full">
      <div className="flex flex-col gap-2 p-4 w-full">
        <div className="flex items-center gap-3 px-2 py-3 bg-gradient-to-r from-[#01be65]/5 to-[#01be65]/10 rounded-lg">
          <Image src="/images/okalogo.png" alt="Oka Logo" width={36} height={36} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[#01be65]">OKA</span>
            <span className="text-[11px] text-muted-foreground">Agence</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 pt-2 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const url = new URL(href, "http://localhost");
            const hrefPath = url.pathname;
            const hrefTab = url.searchParams.get("tab");
            const currentTab = searchParams.get("tab");
            const active = pathname === hrefPath && (hrefTab ? currentTab === hrefTab : true);
            return (
              <Link
                key={`${href}-${label}`}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[#E9FBF3] text-[#01be65] border border-[#C7F3DE]"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-[#01be65]" : "text-slate-500")} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Link
            href="/logout"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4 text-slate-500" />
            <span>Se déconnecter</span>
          </Link>
          <div className="text-xs text-muted-foreground px-3 pt-2">© {new Date().getFullYear()} Oka</div>
        </div>
      </div>
    </aside>
  );
}
