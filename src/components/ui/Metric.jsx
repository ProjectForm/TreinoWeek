import React from "react";

// Número grande de destaque (§10: 28-36px/700) + label abaixo. Usado pra
// volume, calorias, carga máxima etc. — qualquer número que seja o "herói"
// de um card.
export function Metric({ value, unit, label, className = "" }) {
  return (
    <div className={className}>
      <p className="text-metric text-ink-primary tabular-nums">
        {value}
        {unit && <span className="text-body-sm text-ink-tertiary font-semibold ml-1">{unit}</span>}
      </p>
      {label && <p className="text-label uppercase tracking-wide text-ink-tertiary mt-1">{label}</p>}
    </div>
  );
}
