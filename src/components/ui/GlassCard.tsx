"use client";

import type { ReactNode } from "react";

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
        "shadow-[0_0_0_rgba(0,0,0,0)]",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}

