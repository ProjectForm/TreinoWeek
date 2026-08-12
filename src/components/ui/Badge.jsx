import React from "react";

const VARIANTS = {
  neutral: "bg-surface-3 text-ink-secondary",
  primary: "bg-primary-600/20 text-primary-300",
  success: "bg-emerald-500/15 text-emerald-300",
  warning: "bg-amber-500/15 text-amber-300",
};

// §25 — badge de 28px de altura. Reservado pra informação que realmente
// precisa de destaque (não usar pra tudo).
export function Badge({ variant = "neutral", className = "", children, ...rest }) {
  return (
    <span
      className={"inline-flex items-center h-7 px-2.5 rounded-[var(--radius-pill)] text-xs font-semibold " + VARIANTS[variant] + " " + className}
      {...rest}
    >
      {children}
    </span>
  );
}
