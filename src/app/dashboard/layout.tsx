import React from "react";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <Topbar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
