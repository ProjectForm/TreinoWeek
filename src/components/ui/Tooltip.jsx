import React, { useId } from "react";

// Tooltip mínimo, acessível via hover E foco de teclado (não só hover) —
// mais relevante pros breakpoints tablet/desktop (§9) do que no uso mobile
// do dia a dia do app.
export function Tooltip({ label, children, side = "top" }) {
  const id = useId();
  const sideClass = side === "bottom" ? "top-full mt-2" : "bottom-full mb-2";
  return (
    <span className="relative inline-flex group/tooltip">
      {React.cloneElement(children, { "aria-describedby": id })}
      <span
        role="tooltip"
        id={id}
        className={
          "pointer-events-none absolute left-1/2 -translate-x-1/2 " + sideClass +
          " whitespace-nowrap rounded-[var(--radius-xs)] bg-surface-3 border border-line-default px-2 py-1 text-xs text-ink-primary opacity-0 " +
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-opacity duration-micro ease-out z-tooltip"
        }
      >
        {label}
      </span>
    </span>
  );
}
