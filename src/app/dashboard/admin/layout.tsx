import React from "react";

export default function AdminLayout({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <div className="flex h-full">
      {/* Sidebar fixe */}
      <div className="flex-shrink-0 h-full overflow-y-auto">
        {sidebar}
      </div>
      {/* Contenu principal avec scroll */}
      <div className="flex-1 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
