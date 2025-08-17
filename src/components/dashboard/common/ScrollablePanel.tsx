"use client";

import React from "react";

interface ScrollablePanelProps {
  children: React.ReactNode;
  maxHeight?: string; // CSS size string
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollablePanel({ children, maxHeight = "calc(100vh - 240px)", className, style }: ScrollablePanelProps) {
  return (
    <div
      className={className}
      style={{ maxHeight, overflowY: "auto", overscrollBehavior: "contain", ...style }}
    >
      {children}
    </div>
  );
}
