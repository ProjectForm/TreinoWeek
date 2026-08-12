import React from "react";

const LEVELS = { 1: "bg-surface", 2: "bg-surface-2", 3: "bg-surface-3" };

// Primitiva de superfície — os 3 níveis de elevação do design system
// (§5/§28). Card.jsx é a composição mais comum disso; Surface fica
// disponível puro pra casos que não seguem o padding/radius padrão de card.
export function Surface({ level = 1, radius = "lg", border = true, className = "", style, children, ...rest }) {
  return (
    <div
      className={LEVELS[level] + (border ? " border border-line-subtle" : "") + " " + className}
      style={{ borderRadius: `var(--radius-${radius})`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
