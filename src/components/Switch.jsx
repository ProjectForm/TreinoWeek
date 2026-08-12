import React from "react";

// Switch estilo iOS. Estado é sempre controlado pelo pai — este componente
// não guarda nada, então não há preferência persistida por trás dele.
export function Switch({ checked, onChange, label }) {
  // Sem haptic aqui de propósito — reservado a conclusão de série/PR/treino/
  // level up (§29 da Fase 2A-2); alternar um switch não entra nessa lista.
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={
        "relative shrink-0 w-11 h-7 rounded-full transition-colors duration-standard " +
        (checked ? "bg-primary-600" : "bg-surface-3")
      }
    >
      <span
        className={
          "absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 " +
          (checked ? "translate-x-4" : "translate-x-0")
        }
      />
    </button>
  );
}
