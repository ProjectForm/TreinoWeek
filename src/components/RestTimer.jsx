import React from "react";

const R = 17;
const CIRC = 2 * Math.PI * R;

// Timer de descanso flutuante, fica ancorado acima da NavBar. Estado é
// mantido pelo componente pai (WorkoutForm) — este componente só apresenta.
export function RestTimer({ secondsLeft, totalSeconds, onSkip, onAdjust }) {
  if (secondsLeft == null) return null;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom))" }}
    >
      <div className="surface-1 shadow-soft rounded-2xl pl-3 pr-2 py-2 flex items-center gap-3 animate-scaleIn max-w-md mx-auto">
        <div className="relative w-11 h-11 shrink-0">
          <svg viewBox="0 0 40 40" className="w-11 h-11 -rotate-90">
            <circle cx="20" cy="20" r={R} fill="none" stroke="#27272a" strokeWidth="4" />
            <circle
              cx="20" cy="20" r={R} fill="none" stroke="#fb7185" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Descanso</p>
          <p className="text-lg font-bold text-zinc-100 tabular-nums leading-none mt-0.5">{mm}:{ss}</p>
        </div>
        <button
          onClick={() => onAdjust(-15)}
          aria-label="Menos 15 segundos"
          className="press w-8 h-8 rounded-full surface-2 text-zinc-300 text-[11px] font-bold flex items-center justify-center shrink-0"
        >
          −15
        </button>
        <button
          onClick={() => onAdjust(15)}
          aria-label="Mais 15 segundos"
          className="press w-8 h-8 rounded-full surface-2 text-zinc-300 text-[11px] font-bold flex items-center justify-center shrink-0"
        >
          +15
        </button>
        <button onClick={onSkip} className="press px-3 h-8 rounded-full bg-rose-500 text-white text-xs font-semibold shrink-0">
          Pular
        </button>
      </div>
    </div>
  );
}
