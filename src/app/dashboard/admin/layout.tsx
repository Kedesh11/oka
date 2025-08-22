import React from "react";

export default function AdminLayout({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixe */}
      <div className="flex-shrink-0 min-h-screen overflow-y-auto">
        {sidebar}
      </div>
      {/* Contenu principal avec scroll */}
      <div className="flex-1 min-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
