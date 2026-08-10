import React from "react";

// Sanitização (limites, arredondamento) fica a cargo de quem chama onChange
// (updateSet, em useWorkoutData.js) — aqui só calcula o próximo valor bruto.
export function WeightInput({ value, onChange, placeholder }) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-1 flex-1">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, num - 2.5)))}
        className="w-10 h-10 shrink-0 bg-zinc-800 rounded-lg text-zinc-400 font-bold text-lg active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
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
        className="flex-1 h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-2 text-center text-sm text-zinc-100 font-bold outline-none focus:border-rose-500"
      />
      <button
        type="button"
        onClick={() => onChange(String(num + 2.5))}
        className="w-10 h-10 shrink-0 bg-zinc-800 rounded-lg text-zinc-400 font-bold text-lg active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
