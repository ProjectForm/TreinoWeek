import React, { useMemo } from "react";
import { DAYS } from "../constants/plan.js";
import { weekdayFromISO, getWeekKey, getWeekDates } from "../utils/dates.js";
import { NotificationPrompt } from "./NotificationPrompt.jsx";

export function Dashboard({ engineResult, plan, logs, weeks, date, onStartWorkout, onViewChange }) {
  const dayKey = weekdayFromISO(date);
  const todayPlan = plan[dayKey];
  const hasWorkoutToday = todayPlan && todayPlan.items && todayPlan.items.length > 0;
  const treinouHoje = logs[date] && logs[date].status === "completed";

  const weekKey = useMemo(() => getWeekKey(date), [date]);
  const weekData = weeks[weekKey];
  const weekDates = useMemo(() => getWeekDates(date), [date]);

  const sortedAttrs = useMemo(() => {
    const arr = Object.entries(engineResult.atributos || {});
    return arr.sort((a, b) => (a[1]?.nivel || 0) - (b[1]?.nivel || 0));
  }, [engineResult.atributos]);
  const attrDestaque = sortedAttrs[0];

  const step = engineResult.nivel >= 50 ? 10 : 5;
  const proximaMeta = engineResult.nivel >= 90 ? null : Math.ceil((engineResult.nivel + step) / step) * step;

  return (
    <div className="px-4 pt-4 space-y-3">
      <NotificationPrompt plan={plan} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">{engineResult.patente}</p>
            <p className="text-3xl font-bold text-white">LV. {engineResult.nivel}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-teal-400">
              <span className="text-lg">🔥</span>
              <span className="font-bold text-xl">{engineResult.streakAtual}</span>
            </div>
            <p className="text-xs text-zinc-500">semanas</p>
          </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 mt-3">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${engineResult.xpNecessario ? Math.min(100, (engineResult.xp / engineResult.xpNecessario) * 100) : 0}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 mt-1">{engineResult.xp} / {engineResult.xpNecessario} XP</p>
        {engineResult.escudos > 0 && (
          <div className="flex items-center gap-1 mt-2 text-blue-400">
            <span>🛡️</span>
            <span className="text-xs font-medium">{engineResult.escudos} escudo{engineResult.escudos > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Próximo objetivo</p>
        {proximaMeta === null ? (
          <p className="text-sm text-amber-400 font-semibold">⚔️ Faltam {100 - engineResult.nivel} níveis para ascensão!</p>
        ) : (
          <p className="text-sm text-zinc-300">Meta: LV. {proximaMeta} — faltam {proximaMeta - engineResult.nivel} níveis</p>
        )}
        <p className="text-xs text-zinc-600 mt-1">{engineResult.semanasPerfeitasTotal} semanas perfeitas no total</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Hoje</p>
        {treinouHoje ? (
          <div className="flex items-center gap-2 text-teal-400">
            <span className="text-lg">✓</span>
            <p className="text-sm font-semibold">Treino completo!</p>
          </div>
        ) : hasWorkoutToday ? (
          <div>
            <p className="text-sm text-zinc-300 mb-2">{todayPlan.muscle} — {todayPlan.items.length} exercícios</p>
            <button onClick={onStartWorkout} className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">
              Iniciar treino
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Dia de descanso 💤</p>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Esta semana</p>
        <div className="flex gap-1">
          {DAYS.map((d) => {
            const planDia = plan[d];
            const temTreino = planDia && planDia.items && planDia.items.length > 0;
            const isoDia = weekDates.find((wd) => weekdayFromISO(wd) === d);
            const treinou = isoDia && logs[isoDia] && logs[isoDia].status === "completed";
            return (
              <div
                key={d}
                className={
                  "flex-1 text-center py-2 rounded-lg text-xs font-bold " +
                  (!temTreino ? "bg-zinc-950 text-zinc-700" :
                    treinou ? "bg-teal-900 text-teal-400" :
                    d === dayKey ? "bg-rose-900 text-rose-400" :
                    "bg-zinc-800 text-zinc-500")
                }
              >
                {planDia ? planDia.label : d}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          {weekData ? `${weekData.completedDays?.length || 0}/${weekData.plannedDays?.length || 0} treinos completos` : "Nenhum treino registrado nesta semana ainda."}
        </p>
      </div>

      {attrDestaque && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Atributo em desenvolvimento</p>
          <p className="text-sm text-zinc-300 capitalize">{attrDestaque[0]} — Nv. {attrDestaque[1]?.nivel || 0}</p>
          <p className="text-xs text-zinc-600 mt-1">Foque neste atributo treinando com consistência.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onViewChange("personagem")} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left active:scale-95 transition-transform">
          <p className="text-xs text-zinc-500">Ver personagem</p>
          <p className="text-sm font-bold text-zinc-200 mt-1">Atributos e conquistas →</p>
        </button>
        <button onClick={() => onViewChange("historico")} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left active:scale-95 transition-transform">
          <p className="text-xs text-zinc-500">Histórico</p>
          <p className="text-sm font-bold text-zinc-200 mt-1">{Object.keys(logs).length} treinos →</p>
        </button>
      </div>
    </div>
  );
}
