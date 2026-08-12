import React from "react";

// §26 — trilho + preenchimento, sem gradiente por padrão. size="primary" usa
// 8px (progresso principal de uma tela); default usa 6px.
export function ProgressBar({ value, max = 100, size = "default", className = "", label }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={"w-full rounded-[var(--radius-pill)] bg-white/[0.08] overflow-hidden " + (size === "primary" ? "h-2" : "h-1.5") + " " + className}
    >
      <div
        className="h-full rounded-[var(--radius-pill)] bg-primary-400 transition-[width] duration-standard ease-out"
        style={{ width: pct + "%" }}
      />
    </div>
  );
}
