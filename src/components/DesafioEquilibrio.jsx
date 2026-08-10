import React from "react";

export function DesafioEquilibrio({ musculos }) {
  const grupos = Object.entries(musculos);
  const treinados = grupos.filter(([, v]) => v.xp > 0).length;
  const total = grupos.length;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mt-3">
      <p className="text-xs text-amber-400 uppercase tracking-wide">Desafio: Equilíbrio</p>
      <p className="text-sm text-zinc-100 mt-1">Treine todos os 6 grupos musculares pelo menos uma vez</p>
      <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: (treinados / total) * 100 + "%" }} />
      </div>
      <p className="text-xs text-zinc-600 mt-1">{treinados}/{total} grupos com XP registrado</p>
    </div>
  );
}
