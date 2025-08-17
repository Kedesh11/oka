"use client";
import Image from "next/image";
import { Bell, Search, User } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 bg-[#01be65] text-white shadow">
      <div className="mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Image src="/images/okalogo.png" alt="Oka Logo" width={28} height={28} />
          <div className="hidden sm:block font-semibold">Oka Dashboard</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-md bg-white/10 px-2">
            <Search className="h-4 w-4 opacity-90" />
            <input className="h-8 w-44 bg-transparent outline-none text-sm placeholder:white/80" placeholder="Rechercher..." />
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
