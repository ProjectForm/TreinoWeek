import React, { useMemo } from "react";
import { weekdayFromISO, getWeekKey } from "../utils/dates.js";
import { DEFAULT_BODY } from "../constants/config.js";
import { NotificationPrompt } from "./NotificationPrompt.jsx";
import { WeekStrip } from "./WeekStrip.jsx";
import { MissaoAtiva } from "./MissaoAtiva.jsx";
import { Icon } from "./Icon.jsx";

export function Dashboard({ engineResult, plan, logs, weeks, date, bodyStats, onStartWorkout, onViewChange }) {
  const dayKey = weekdayFromISO(date);
  const todayPlan = plan[dayKey];
  const hasWorkoutToday = todayPlan && todayPlan.items && todayPlan.items.length > 0;
  const treinouHoje = logs[date] && logs[date].status === "completed";

  const weekKey = useMemo(() => getWeekKey(date), [date]);
  const weekData = weeks[weekKey];

  const sortedAttrs = useMemo(() => {
    const arr = Object.entries(engineResult.atributos || {});
    return arr.sort((a, b) => (a[1]?.nivel || 0) - (b[1]?.nivel || 0));
  }, [engineResult.atributos]);
  const attrDestaque = sortedAttrs[0];

  const step = engineResult.nivel >= 50 ? 10 : 5;
  const proximaMeta = engineResult.nivel >= 90 ? null : Math.ceil((engineResult.nivel + step) / step) * step;

  const estimatedDuration = useMemo(() => {
    if (!hasWorkoutToday) return 0;
    const totalSets = todayPlan.items.reduce((a, it) => a + it.sets, 0);
    const secPerSet = (bodyStats && bodyStats.secPerSet) || DEFAULT_BODY.secPerSet;
    return Math.round((totalSets * secPerSet) / 60);
  }, [hasWorkoutToday, todayPlan, bodyStats]);

  return (
    <div className="px-4 pt-4 space-y-3 pb-2">
      <NotificationPrompt plan={plan} />

      {/* Nível 1 — status do personagem, a informação de maior hierarquia */}
      <div className="surface-1 shadow-soft rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium">{engineResult.patente}</p>
            <p className="text-4xl font-bold text-zinc-50 mt-0.5 tabular-nums">LV {engineResult.nivel}</p>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300 mt-1">
            <Icon name="flame" size={18} className="text-rose-400" filled />
            <span className="font-semibold tabular-nums">{engineResult.streakAtual}</span>
            <span className="text-xs text-zinc-500">sem.</span>
          </div>
        </div>

        <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-4">
          <div
            className="bg-rose-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${engineResult.xpNecessario ? Math.min(100, (engineResult.xp / engineResult.xpNecessario) * 100) : 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-zinc-500 tabular-nums">{engineResult.xp} / {engineResult.xpNecessario} XP</p>
          <p className="text-xs text-zinc-500">
            {proximaMeta === null ? `${100 - engineResult.nivel} p/ ascensão` : `próx. LV ${proximaMeta}`}
          </p>
        </div>

        {engineResult.escudos > 0 && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t divider">
            <Icon name="shield" size={15} className="text-sky-400" filled />
            <span className="text-xs text-zinc-400">{engineResult.escudos} escudo{engineResult.escudos > 1 ? "s" : ""} de proteção da streak</span>
          </div>
        )}
      </div>

      {/* Nível 1 — ação principal do app */}
      <div className={"rounded-2xl p-5 " + (treinouHoje ? "surface-1" : "bg-gradient-to-b from-rose-500/[0.08] to-transparent surface-1 border-rose-500/20")}>
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2">Hoje</p>
        {treinouHoje ? (
          <div className="flex items-center gap-2 text-teal-400">
            <Icon name="checkCircle" size={20} filled className="text-teal-400" />
            <p className="text-sm font-semibold">Treino completo</p>
          </div>
        ) : hasWorkoutToday ? (
          <div>
            <p className="text-lg font-semibold text-zinc-100">{todayPlan.muscle}</p>
            <p className="text-sm text-zinc-500 mt-0.5">
              {todayPlan.items.length} exercícios{estimatedDuration ? ` · ~${estimatedDuration} min` : ""}
            </p>
            <button onClick={onStartWorkout} className="press w-full bg-rose-500 text-white font-semibold py-3.5 rounded-xl mt-4">
              Iniciar treino
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Dia de descanso. Aproveite para recuperar.</p>
        )}
      </div>

      {/* Nível 2 — semana e missão */}
      <div className="surface-1 rounded-2xl p-4">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2.5">Esta semana</p>
        <WeekStrip date={date} plan={plan} logs={logs} readOnly />
        <p className="text-xs text-zinc-500 mt-2.5">
          {weekData ? `${weekData.completedDays?.length || 0}/${weekData.plannedDays?.length || 0} treinos completos` : "Nenhum treino registrado nesta semana ainda."}
        </p>
      </div>

      <MissaoAtiva plan={plan} logs={logs} weeks={weeks} date={date} engineResult={engineResult} />

      {/* Nível 3 — detalhe simples, sem card próprio */}
      {attrDestaque && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-zinc-500">
            Foco atual: <span className="text-zinc-300 capitalize font-medium">{attrDestaque[0]}</span>
          </p>
          <p className="text-xs text-zinc-500">Nv. {attrDestaque[1]?.nivel || 0}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={() => onViewChange("personagem")} className="press surface-1 rounded-xl p-3 text-left">
          <p className="text-xs text-zinc-500">Personagem</p>
          <p className="text-sm font-semibold text-zinc-200 mt-0.5">Atributos e conquistas</p>
        </button>
        <button onClick={() => onViewChange("historico")} className="press surface-1 rounded-xl p-3 text-left">
          <p className="text-xs text-zinc-500">Histórico</p>
          <p className="text-sm font-semibold text-zinc-200 mt-0.5">{Object.keys(logs).length} treinos</p>
        </button>
      </div>
    </div>
  );
}
