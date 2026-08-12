import React from "react";
import { Icon } from "../Icon.jsx";

// Botão só de ícone — sempre exige `label` (vira aria-label), já que não há
// texto visível. Área de toque de 44×44px mesmo com ícone menor (spec Fase
// 2A-1 §19), generalizando o padrão usado em MuscleExercisesModal/RestTimer.
export function IconButton({ icon, label, size = 20, active = false, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={
        "w-11 h-11 shrink-0 rounded-[var(--radius-pill)] flex items-center justify-center " +
        "transition-[background-color,transform,opacity] duration-standard ease-out active:scale-[0.98] active:duration-micro " +
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 " +
        (active ? "bg-primary-600 text-white" : "bg-surface-2 text-ink-secondary hover:bg-surface-3") +
        " " + className
      }
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
