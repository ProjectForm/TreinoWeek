import React from "react";

// Sanitização fica a cargo de quem chama onChange (updateSet, em
// useWorkoutData.js) — aqui só calcula o próximo valor bruto.
// Largura fixa (36px botão / 40px input) — como agora fica em sua própria
// linha (ver WorkoutForm), o input tem espaço de sobra pra números de 2-3
// dígitos ficarem legíveis, sem cortar.
export function RepsInput({ value, onChange, placeholder }) {
  const num = parseInt(value, 10) || 0;
  return (
    <div className="flex items-center gap-0.5 w-32 shrink-0">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(0, num - 1)))}
        className="stepper-btn shrink-0 bg-zinc-800 rounded text-zinc-400 text-sm active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "reps"}
        className="stepper-input flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-1 text-center text-sm text-zinc-100 font-bold outline-none focus:border-rose-500"
      />
      <button
        type="button"
        onClick={() => onChange(String(num + 1))}
        className="stepper-btn shrink-0 bg-zinc-800 rounded text-zinc-400 text-sm active:bg-zinc-700 active:scale-95 transition-transform flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
