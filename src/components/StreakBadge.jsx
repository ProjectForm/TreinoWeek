import React from "react";

export function StreakBadge({ streakAtual, escudos, semanasPerfeitasTotal }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-3">
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-zinc-500">Streak atual</p>
          <p className="text-xl font-bold text-teal-400">{streakAtual} semanas</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-500">Escudos</p>
          <p className="text-xl font-bold text-zinc-100">{escudos}/2</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Semanas perfeitas</p>
          <p className="text-xl font-bold text-zinc-100">{semanasPerfeitasTotal}</p>
        </div>
      </div>
    </div>
  );
}
