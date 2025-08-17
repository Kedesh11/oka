"use client";

import React from "react";

interface SectionHeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ title, actions, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      <div className="text-lg font-semibold">{title}</div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
