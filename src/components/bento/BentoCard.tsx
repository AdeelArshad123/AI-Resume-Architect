"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

export function BentoCard({
  children,
  colSpan = 12,
  rowSpan = 1,
  className = ""
}: {
  children: ReactNode;
  colSpan?: number; // 1..12
  rowSpan?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
    >
      <GlassCard className={`h-full ${className}`}>{children}</GlassCard>
    </motion.div>
  );
}

