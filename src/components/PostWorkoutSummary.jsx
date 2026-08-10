import React from "react";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { formatWeight, formatBR } from "../utils/formatters.js";

export function PostWorkoutSummary({ dayData, previousSameDay, rpg, onContinue }) {
  const statusLabel = dayData.status === "completed" ? "Dia completo — conta para streak"
    : dayData.status === "partial" ? "Dia parcial — não conta para streak"
    : "Dia sem exercícios registrados";
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <h2 className="text-xl font-bold text-rose-400 mb-4">Treino concluído</h2>

      {rpg && rpg.primeiroTreino && (
        <div className="bg-zinc-900 border border-amber-700 rounded-xl p-4 mb-3 text-center">
          <p className="text-sm text-amber-400 font-semibold">Seu personagem despertou.</p>
          <p className="text-xs text-zinc-400 mt-1">Conquista: Primeiro Passo</p>
        </div>
      )}

      {rpg && (rpg.narratives.length > 0 || rpg.weekBreakdown) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
          <p className="text-sm text-zinc-400 mb-2">Progresso do personagem</p>
          {rpg.narratives.map((n, i) => (
            <p key={i} className="text-sm text-teal-400">
              {n.type === "pr" ? "Novo PR: " + (DEFAULT_EXERCISES[n.exId] ? DEFAULT_EXERCISES[n.exId].name : n.exId) + " +" + n.delta.toFixed(1) + "kg" : ""}
            </p>
          ))}
          {rpg.streakAtual > 0 && (
            <p className="text-sm text-amber-400 mt-1">Streak {rpg.streakAtual} — multiplicador {rpg.multiplicador.toFixed(2)}×</p>
          )}
          {rpg.escudos < 2 && (
            <p className="text-xs text-zinc-500 mt-1">
              Progresso para escudo: {rpg.streakAtual % 3 === 0 && rpg.streakAtual > 0 ? 3 : 3 - (rpg.streakAtual % 3)} semana(s) restantes
            </p>
          )}
          {rpg.weekBreakdown && (
            <div className="mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-500 space-y-0.5">
              <p>+{Math.round(rpg.weekBreakdown.xpCons)} XP Consistência, +{Math.round(rpg.weekBreakdown.xpDisc)} XP Disciplina (semana fechada)</p>
              {rpg.weekBreakdown.escudoGanhoAgora && <p className="text-teal-400">Novo escudo conquistado!</p>}
              {rpg.weekBreakdown.ressurgiuAgora && <p className="text-amber-400">Título "Ressurgido" desbloqueado (+2000 XP Disciplina)</p>}
            </div>
          )}
          {rpg.flags.length > 0 && (
            <div className="mt-2 pt-2 border-t border-zinc-800">
              {rpg.flags.map((f, i) => <p key={i} className="text-xs text-amber-500">{f}</p>)}
            </div>
          )}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
        <p className="text-sm text-zinc-400">Volume total</p>
        <p className="text-2xl font-bold text-zinc-100">{formatWeight(dayData.meta.totalVolume)}</p>
        {previousSameDay && (
          <p className="text-xs text-teal-400 mt-1">
            {dayData.meta.totalVolume > previousSameDay.meta.totalVolume ? "▲" : "▼"} vs último treino ({formatBR(previousSameDay.date)}: {formatWeight(previousSameDay.meta.totalVolume)})
          </p>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
        <p className="text-sm text-zinc-400">Calorias estimadas</p>
        <p className="text-2xl font-bold text-zinc-100">{Math.round(dayData.kcal)} kcal</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
        <p className="text-sm text-zinc-400 mb-2">Grupos musculares trabalhados</p>
        {Object.entries(dayData.groupVolumes || {}).filter(([, v]) => v > 0).map(([group, volume]) => (
          <div key={group} className="flex justify-between text-sm py-1">
            <span className="text-zinc-300">{group}</span>
            <span className="text-zinc-100 font-medium">{formatWeight(volume)}</span>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
        <p className="text-sm text-zinc-400 mb-2">Exercícios</p>
        <p className="text-lg font-bold text-zinc-100">
          {dayData.meta.totalExercisesCompleted} / {dayData.meta.totalExercisesPlanned}
        </p>
        <p className="text-xs text-zinc-500">{statusLabel}</p>
      </div>

      <button onClick={onContinue} className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl mt-4">
        Continuar
      </button>
    </div>
  );
}
