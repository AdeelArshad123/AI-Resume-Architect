"use client";

import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm",
        "text-white placeholder:text-white/40",
        "focus:outline-none focus:ring-2 focus:ring-electric/40",
        className
      ].join(" ")}
    />
  );
}

