"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium",
        "text-white hover:bg-white/10 active:bg-white/15 transition",
        props.disabled ? "opacity-50 cursor-not-allowed" : "",
        "shadow-[0_0_0.75rem_rgba(47,123,255,0.08)]",
        className
      ].join(" ")}
    >
      {children}
    </button>
  );
}

