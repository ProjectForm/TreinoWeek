import React from "react";

export function AscensaoModal({ historico, onContinue }) {
  const ultima = historico[historico.length - 1];
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
      <div className="surface-1 shadow-soft border border-amber-500/25 rounded-2xl p-6 w-full max-w-xs text-center animate-scaleIn">
        <p className="text-[11px] text-amber-400 uppercase tracking-widest font-medium">Ascensão</p>
        <p className="text-2xl font-bold text-zinc-100 mt-2">{ultima.de}</p>
        <p className="text-rose-400 text-2xl my-1">↓</p>
        <p className="text-2xl font-bold text-amber-400">{ultima.para}</p>
        <div className="surface-2 rounded-xl p-4 mt-6">
          <p className="text-xs text-zinc-500">Streak máxima na fase concluída</p>
          <p className="text-lg font-bold text-zinc-100 mt-0.5">{ultima.streakMaxima} semanas</p>
        </div>
        <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
          Seu nível geral volta a 0, mas atributos e grupos musculares continuam — e você ganha +5% de XP permanente em todas as fontes.
        </p>
        <button onClick={onContinue} className="press w-full bg-rose-500 text-white font-semibold py-3 rounded-xl mt-6">
          Continuar
        </button>
      </div>
    </div>
  );
}
