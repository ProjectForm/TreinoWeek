import React from "react";

export function AscensaoModal({ historico, onContinue }) {
  const ultima = historico[historico.length - 1];
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-xs text-amber-400 uppercase tracking-widest">Ascensão</p>
      <p className="text-2xl font-bold text-zinc-100 mt-2">{ultima.de}</p>
      <p className="text-rose-400 text-3xl my-1">↓</p>
      <p className="text-2xl font-bold text-amber-400">{ultima.para}</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-6 w-full max-w-xs">
        <p className="text-xs text-zinc-500">Streak máxima na fase concluída</p>
        <p className="text-lg font-bold text-zinc-100">{ultima.streakMaxima} semanas</p>
      </div>
      <p className="text-xs text-zinc-600 mt-4 max-w-xs">
        Seu nível geral volta a 0, mas atributos e grupos musculares continuam — e você ganha +5% de XP permanente em todas as fontes.
      </p>
      <button onClick={onContinue} className="w-full max-w-xs bg-rose-500 text-white font-semibold py-3 rounded-xl mt-6">
        Continuar
      </button>
    </div>
  );
}
