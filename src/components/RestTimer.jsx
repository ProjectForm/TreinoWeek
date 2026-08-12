import React from "react";

const R = 19;
const CIRC = 2 * Math.PI * R;

// Timer de descanso flutuante, fica ancorado acima da NavBar. Estado é
// mantido pelo componente pai (WorkoutForm) — este componente só apresenta.
// §20: overlay com fundo translúcido + blur (nunca abaixo de ~90% de opacidade
// pra conteúdo importante), tempo em destaque (32-40px), botão "Pular" com
// no mínimo 44px de alvo de toque.
export function RestTimer({ secondsLeft, totalSeconds, onSkip, onAdjust }) {
  if (secondsLeft == null) return null;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;

  return (
    <div
      className="fixed left-0 right-0 z-floating px-4"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom))" }}
    >
      <div
        className="rounded-[var(--radius-lg)] p-3.5 animate-scaleIn max-w-md mx-auto border border-white/[0.08] shadow-[var(--shadow-lg)]"
        style={{ backgroundColor: "rgba(20, 23, 27, 0.94)", backdropFilter: "blur(var(--blur-md))" }}
      >
        {/* Duas linhas em vez de uma só (§20): em telas de 320px, anel + tempo
            grande + 3 botões de ação numa linha só ficava espremido/cortado. */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 shrink-0">
            <svg viewBox="0 0 48 48" className="w-11 h-11 -rotate-90">
              <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle
                cx="24" cy="24" r={R} fill="none" stroke="#2DD4BF" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - pct / 100)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-ink-tertiary uppercase tracking-wide">Descanso</p>
            <p className="text-[32px] font-bold text-ink-primary tabular-nums leading-none mt-0.5">{mm}:{ss}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onAdjust(-15)}
            aria-label="Menos 15 segundos"
            className="press flex-1 h-11 rounded-[var(--radius-md)] bg-surface-2 text-ink-secondary text-[13px] font-bold flex items-center justify-center"
          >
            −15s
          </button>
          <button
            onClick={() => onAdjust(15)}
            aria-label="Mais 15 segundos"
            className="press flex-1 h-11 rounded-[var(--radius-md)] bg-surface-2 text-ink-secondary text-[13px] font-bold flex items-center justify-center"
          >
            +15s
          </button>
          <button onClick={onSkip} className="press flex-1 h-11 rounded-[var(--radius-md)] bg-surface-3 text-ink-primary text-[13px] font-semibold flex items-center justify-center">
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}
