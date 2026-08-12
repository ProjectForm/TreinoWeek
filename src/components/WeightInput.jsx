import React from "react";

// Sanitização (limites, arredondamento) fica a cargo de quem chama onChange
// (updateSet, em useWorkoutData.js) — aqui só calcula o próximo valor bruto.
// Tamanhos compactos (36px botão / 40px input) pra caber em telas de 320px
// mesmo em linhas com dois campos de peso (exercícios unilaterais).
export function WeightInput({ value, onChange, placeholder }) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-0.5 flex-1 min-w-0">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, num - 2.5)))}
        aria-label="Diminuir peso em 2,5kg"
        className="stepper-btn shrink-0 bg-zinc-800 rounded text-zinc-400 text-sm active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
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
        className="stepper-input flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-1 text-center text-sm text-zinc-100 font-bold outline-none focus:border-rose-500"
      />
      <button
        type="button"
        onClick={() => onChange(String(num + 2.5))}
        aria-label="Aumentar peso em 2,5kg"
        className="stepper-btn shrink-0 bg-zinc-800 rounded text-zinc-400 text-sm active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
