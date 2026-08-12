import React from "react";

// Cabeçalho de seção — título (fontSize "section", token da Fase 2A-1) +
// subtítulo/ação opcionais à direita.
export function SectionHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={"flex items-end justify-between gap-3 " + className}>
      <div>
        <h2 className="text-section text-ink-primary">{title}</h2>
        {subtitle && <p className="text-caption text-ink-secondary mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
