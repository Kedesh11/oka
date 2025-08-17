import React from "react";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col min-h-screen min-h-0">
        <Topbar />
        <main className="p-4 md:p-6 lg:p-8 flex-1 overflow-hidden min-h-0">{children}</main>
      </div>
    </div>
  );
}
