import React from "react";

export function AscensaoModal({ historico, onContinue }) {
  const ultima = historico[historico.length - 1];
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-zinc-900 border border-amber-700/50 rounded-2xl p-6 w-full max-w-xs text-center animate-scaleIn">
        <p className="text-xs text-amber-400 uppercase tracking-widest">Ascensão</p>
        <p className="text-2xl font-bold text-zinc-100 mt-2">{ultima.de}</p>
        <p className="text-rose-400 text-3xl my-1">↓</p>
        <p className="text-2xl font-bold text-amber-400">{ultima.para}</p>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-6">
          <p className="text-xs text-zinc-500">Streak máxima na fase concluída</p>
          <p className="text-lg font-bold text-zinc-100">{ultima.streakMaxima} semanas</p>
        </div>
        <p className="text-xs text-zinc-600 mt-4">
          Seu nível geral volta a 0, mas atributos e grupos musculares continuam — e você ganha +5% de XP permanente em todas as fontes.
        </p>
        <button onClick={onContinue} className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl mt-6">
          Continuar
        </button>
      </div>
    </div>
  );
}
