import React from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import AntdProvider from "@/components/providers/AntdProvider";
import '@ant-design/v5-patch-for-react-19';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AntdProvider>
      <div className="h-screen bg-background text-foreground flex flex-col">
        <Topbar />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </AntdProvider>
  );
}
