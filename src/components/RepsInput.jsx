import React from "react";

// Sanitização fica a cargo de quem chama onChange (updateSet, em
// useWorkoutData.js). Mesma escala de tamanhos que WeightInput (§15/§16).
const VALUE_SIZE = { default: "text-lg", large: "text-[28px] leading-none" };

export function RepsInput({ value, onChange, placeholder, size = "default" }) {
  const num = parseInt(value, 10) || 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, num - 1)))}
        aria-label="Diminuir repetições em 1"
        className="press w-11 h-11 shrink-0 rounded-[var(--radius-sm)] bg-surface-2 text-ink-secondary text-xl flex items-center justify-center"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "reps"}
        aria-label="Repetições"
        className={
          "min-w-[64px] w-16 h-11 bg-transparent text-center font-bold text-ink-primary outline-none rounded-[var(--radius-xs)] " +
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 focus-visible:outline-offset-2 " +
          VALUE_SIZE[size]
        }
      />
      <button
        type="button"
        onClick={() => onChange(String(num + 1))}
        aria-label="Aumentar repetições em 1"
        className="press w-11 h-11 shrink-0 rounded-[var(--radius-sm)] bg-surface-2 text-ink-secondary text-xl flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
