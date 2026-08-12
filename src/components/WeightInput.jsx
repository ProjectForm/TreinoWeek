import React from "react";

// Sanitização (limites, arredondamento) fica a cargo de quem chama onChange
// (updateSet, em useWorkoutData.js) — aqui só calcula o próximo valor bruto.
// §16: botões de 44×44px (mínimo do design system), valor central com pelo
// menos 64px de largura. size="large" é usado na série atual em foco (§15,
// números de 28-32px); size="default" nas demais linhas da lista.
const VALUE_SIZE = { default: "text-lg", large: "text-[28px] leading-none" };

export function WeightInput({ value, onChange, placeholder, size = "default" }) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, num - 2.5)))}
        aria-label="Diminuir peso em 2,5 quilogramas"
        className="press w-11 h-11 shrink-0 rounded-[var(--radius-sm)] bg-surface-2 text-ink-secondary text-xl flex items-center justify-center"
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        step="0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "kg"}
        aria-label={"Peso em " + (placeholder || "kg")}
        className={
          "min-w-[64px] flex-1 h-11 bg-transparent text-center font-bold text-ink-primary outline-none rounded-[var(--radius-xs)] " +
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 focus-visible:outline-offset-2 " +
          VALUE_SIZE[size]
        }
      />
      <button
        type="button"
        onClick={() => onChange(String(num + 2.5))}
        aria-label="Aumentar peso em 2,5 quilogramas"
        className="press w-11 h-11 shrink-0 rounded-[var(--radius-sm)] bg-surface-2 text-ink-secondary text-xl flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
