import React from "react";

// Sanitização fica a cargo de quem chama onChange (updateSet, em
// useWorkoutData.js) — aqui só calcula o próximo valor bruto.
export function RepsInput({ value, onChange, placeholder }) {
  const num = parseInt(value, 10) || 0;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, num - 1)))}
        className="w-8 h-10 shrink-0 bg-zinc-800 rounded-lg text-zinc-400 font-bold active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "reps"}
        className="w-16 h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-1 text-center text-sm text-zinc-100 font-bold outline-none focus:border-rose-500"
      />
      <button
        type="button"
        onClick={() => onChange(String(num + 1))}
        className="w-8 h-10 shrink-0 bg-zinc-800 rounded-lg text-zinc-400 font-bold active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
