import React from "react";

export default function AdminLayout({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <div className="flex gap-0 h-[100dvh] min-h-0">
      <div className="sticky top-0 self-start h-[100dvh] overflow-hidden">{sidebar}</div>
      <div className="flex-1 h-[100dvh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
