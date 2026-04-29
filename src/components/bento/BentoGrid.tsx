"use client";

import type { ReactNode } from "react";

export function BentoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {children}
    </div>
  );
}

