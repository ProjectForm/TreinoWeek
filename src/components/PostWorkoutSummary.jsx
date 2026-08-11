import React from "react";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { formatWeight, formatBR } from "../utils/formatters.js";
import { Icon } from "./Icon.jsx";

export function PostWorkoutSummary({ dayData, previousSameDay, rpg, onContinue }) {
  const statusLabel = dayData.status === "completed" ? "Dia completo — conta para streak"
    : dayData.status === "partial" ? "Dia parcial — não conta para streak"
    : "Dia sem exercícios registrados";

  const volumeDelta = previousSameDay
    ? dayData.meta.totalVolume - previousSameDay.meta.totalVolume
    : null;
  const volumeDeltaPct = volumeDelta !== null && previousSameDay.meta.totalVolume > 0
    ? Math.round((volumeDelta / previousSameDay.meta.totalVolume) * 100)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 pb-8">
      <div className="text-center pt-6 pb-2 animate-popIn">
        <Icon name="checkCircle" size={40} filled className="text-teal-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-50 mt-3">Treino concluído</h2>
      </div>

      {rpg && rpg.primeiroTreino && (
        <div className="surface-1 rounded-2xl p-4 mt-4 text-center">
          <p className="text-sm text-amber-400 font-semibold">Seu personagem despertou</p>
          <p className="text-xs text-zinc-500 mt-1">Conquista desbloqueada: Primeiro Passo</p>
        </div>
      )}

      {rpg && (rpg.narratives.length > 0 || rpg.weekBreakdown) && (
        <div className="surface-1 rounded-2xl p-4 mt-3">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2">Progresso do personagem</p>
          {rpg.narratives.map((n, i) => (
            <p key={i} className="text-sm text-teal-400 font-medium">
              {n.type === "pr" ? "Novo PR: " + (DEFAULT_EXERCISES[n.exId] ? DEFAULT_EXERCISES[n.exId].name : n.exId) + " +" + n.delta.toFixed(1) + "kg" : ""}
            </p>
          ))}
          {rpg.streakAtual > 0 && (
            <p className="text-sm text-zinc-300 mt-1">Streak {rpg.streakAtual} · multiplicador {rpg.multiplicador.toFixed(2)}×</p>
          )}
          {rpg.escudos < 2 && (
            <p className="text-xs text-zinc-500 mt-1">
              Progresso para escudo: {rpg.streakAtual % 3 === 0 && rpg.streakAtual > 0 ? 3 : 3 - (rpg.streakAtual % 3)} semana(s) restantes
            </p>
          )}
          {rpg.weekBreakdown && (
            <div className="mt-2 pt-2 border-t divider text-xs text-zinc-500 space-y-0.5">
              <p>+{Math.round(rpg.weekBreakdown.xpCons)} XP Consistência, +{Math.round(rpg.weekBreakdown.xpDisc)} XP Disciplina (semana fechada)</p>
              {rpg.weekBreakdown.escudoGanhoAgora && <p className="text-teal-400">Novo escudo conquistado</p>}
              {rpg.weekBreakdown.ressurgiuAgora && <p className="text-amber-400">Título "Ressurgido" desbloqueado (+2000 XP Disciplina)</p>}
            </div>
          )}
          {rpg.flags.length > 0 && (
            <div className="mt-2 pt-2 border-t divider">
              {rpg.flags.map((f, i) => <p key={i} className="text-xs text-amber-500">{f}</p>)}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="surface-1 rounded-2xl p-4">
          <p className="text-xs text-zinc-500">Volume total</p>
          <p className="text-2xl font-bold text-zinc-50 mt-0.5 tabular-nums">{formatWeight(dayData.meta.totalVolume)}</p>
          {volumeDelta !== null && (
            <p className={"text-xs mt-1 " + (volumeDelta >= 0 ? "text-teal-400" : "text-zinc-500")}>
              {volumeDelta >= 0 ? "▲" : "▼"} {volumeDeltaPct !== null ? `${Math.abs(volumeDeltaPct)}%` : ""} vs último ({formatBR(previousSameDay.date)})
            </p>
          )}
        </div>
        <div className="surface-1 rounded-2xl p-4">
          <p className="text-xs text-zinc-500">Calorias</p>
          <p className="text-2xl font-bold text-zinc-50 mt-0.5 tabular-nums">~{Math.round(dayData.kcal)}</p>
          <p className="text-xs text-zinc-500 mt-1">kcal estimadas</p>
        </div>
      </div>

      <div className="surface-1 rounded-2xl p-4 mt-3">
        <p className="text-xs text-zinc-500 mb-2">Grupos musculares trabalhados</p>
        {Object.entries(dayData.groupVolumes || {}).filter(([, v]) => v > 0).map(([group, volume], i) => (
          <div key={group} className={"flex justify-between text-sm py-1.5 " + (i > 0 ? "border-t divider" : "")}>
            <span className="text-zinc-300">{group}</span>
            <span className="text-zinc-100 font-medium tabular-nums">{formatWeight(volume)}</span>
          </div>
        ))}
      </div>

      <div className="surface-1 rounded-2xl p-4 mt-3">
        <p className="text-xs text-zinc-500">Exercícios</p>
        <p className="text-lg font-bold text-zinc-100 mt-0.5 tabular-nums">
          {dayData.meta.totalExercisesCompleted} / {dayData.meta.totalExercisesPlanned}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{statusLabel}</p>
      </div>

      <button onClick={onContinue} className="press w-full bg-rose-500 text-white font-semibold py-3.5 rounded-2xl mt-5">
        Continuar
      </button>
    </div>
  );
}
