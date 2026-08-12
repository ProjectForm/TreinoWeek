import React, { useMemo } from "react";
import { weekdayFromISO, getWeekKey } from "../utils/dates.js";
import { DEFAULT_BODY } from "../constants/config.js";
import { NotificationPrompt } from "./NotificationPrompt.jsx";
import { WeekStrip } from "./WeekStrip.jsx";
import { MissaoAtiva } from "./MissaoAtiva.jsx";
import { Icon } from "./Icon.jsx";
import { Button } from "./ui/Button.jsx";
import { Card } from "./ui/Card.jsx";
import { SectionHeader } from "./ui/SectionHeader.jsx";
import { Metric } from "./ui/Metric.jsx";
import { EmptyState } from "./ui/EmptyState.jsx";
import { ProgressBar } from "./ui/ProgressBar.jsx";

function saudacao() {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada,";
  if (h < 12) return "Bom dia,";
  if (h < 18) return "Boa tarde,";
  return "Boa noite,";
}

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

  const headline = treinouHoje
    ? "Treino de hoje concluído."
    : hasWorkoutToday
      ? "Seu treino está pronto."
      : "Hoje é dia de descanso.";

  return (
    <div className="px-4 pt-4 space-y-6 pb-2" style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}>
      {/* HEADER — saudação, não compete com o resto da hierarquia */}
      <div>
        <p className="text-body-sm text-ink-secondary">{saudacao()}</p>
        <p className="text-title text-ink-primary mt-0.5">{headline}</p>
      </div>

      <NotificationPrompt plan={plan} />

      {/* PRIMARY STATE — "como estou?": nível é a métrica protagonista,
          streak/XP ficam como suporte. Gradiente teal muito sutil + brilho
          radial controlado (§4). */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line-subtle p-5">
        <div className="absolute inset-0 bg-surface" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.14] via-transparent to-transparent" aria-hidden="true" />
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary-400/10"
          style={{ filter: "blur(56px)" }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label uppercase text-ink-tertiary">{engineResult.patente}</p>
              <p className="text-display text-ink-primary tabular-nums mt-1">LV {engineResult.nivel}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Icon name="flame" size={16} className="text-primary-400" filled />
              <span className="text-body-sm font-semibold text-ink-secondary tabular-nums">{engineResult.streakAtual}</span>
              <span className="text-caption text-ink-tertiary">sem.</span>
            </div>
          </div>

          <ProgressBar
            value={engineResult.xp}
            max={engineResult.xpNecessario || 1}
            className="mt-4"
            label={`Progresso de XP: ${engineResult.xp} de ${engineResult.xpNecessario}`}
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-caption text-ink-tertiary tabular-nums">{engineResult.xp} / {engineResult.xpNecessario} XP</p>
            <p className="text-caption text-ink-tertiary">
              {proximaMeta === null ? `${100 - engineResult.nivel} p/ ascensão` : `próx. LV ${proximaMeta}`}
            </p>
          </div>

          {engineResult.escudos > 0 && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-line-subtle">
              <Icon name="shield" size={14} className="text-primary-400" filled />
              <span className="text-caption text-ink-tertiary">{engineResult.escudos} escudo{engineResult.escudos > 1 ? "s" : ""} de proteção da streak</span>
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S WORKOUT — "o que devo fazer agora?": único CTA dominante da tela */}
      <div>
        <SectionHeader title="Treino de hoje" className="mb-2 px-1" />
        <Card variant={hasWorkoutToday && !treinouHoje ? "featured" : "default"}>
          {treinouHoje ? (
            <div className="flex items-center gap-2">
              <Icon name="checkCircle" size={20} filled className="text-primary-400" />
              <p className="text-body font-semibold text-ink-primary">Treino completo</p>
            </div>
          ) : hasWorkoutToday ? (
            <div>
              <p className="text-title text-ink-primary">{todayPlan.muscle}</p>
              <p className="text-body-sm text-ink-secondary mt-1">
                {todayPlan.items.length} exercícios{estimatedDuration ? ` · ~${estimatedDuration} min` : ""}
              </p>
              <Button onClick={onStartWorkout} size="large" className="w-full mt-4">
                Começar treino
                <Icon name="dumbbell" size={18} />
              </Button>
            </div>
          ) : (
            <p className="text-body-sm text-ink-secondary">Dia de descanso. Aproveite para recuperar.</p>
          )}
        </Card>
      </div>

      {/* WEEK / CONSISTENCY */}
      <div>
        <SectionHeader title="Esta semana" className="mb-2 px-1" />
        <Card>
          <WeekStrip date={date} plan={plan} logs={logs} readOnly />
          <p className="text-caption text-ink-tertiary mt-3">
            {weekData ? `${weekData.completedDays?.length || 0}/${weekData.plannedDays?.length || 0} treinos completos` : "Nenhum treino registrado nesta semana ainda."}
          </p>
        </Card>
      </div>

      {/* PROGRESS HIGHLIGHT — "estou evoluindo?": um insight só */}
      <div>
        <SectionHeader title="Progresso" className="mb-2 px-1" />
        <Card>
          {engineResult.totalPRs > 0 ? (
            <Metric value={engineResult.totalPRs} label="recordes de carga já batidos" />
          ) : (
            <EmptyState
              icon="target"
              title="Ainda sem recordes"
              description="Continue treinando pra bater seu primeiro recorde de carga."
              className="py-2"
            />
          )}
        </Card>
      </div>

      {/* SECONDARY INFORMATION */}
      <MissaoAtiva plan={plan} logs={logs} weeks={weeks} date={date} engineResult={engineResult} />

      {attrDestaque && (
        <div className="flex items-center justify-between px-1 -mt-3">
          <p className="text-caption text-ink-tertiary">
            Foco atual: <span className="text-ink-secondary capitalize font-medium">{attrDestaque[0]}</span>
          </p>
          <p className="text-caption text-ink-tertiary">Nv. {attrDestaque[1]?.nivel || 0}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={() => onViewChange("personagem")} className="press bg-surface border border-line-subtle rounded-[var(--radius-lg)] p-3 text-left">
          <p className="text-caption text-ink-tertiary">Personagem</p>
          <p className="text-body-sm font-semibold text-ink-primary mt-0.5">Atributos e conquistas</p>
        </button>
        <button onClick={() => onViewChange("historico")} className="press bg-surface border border-line-subtle rounded-[var(--radius-lg)] p-3 text-left">
          <p className="text-caption text-ink-tertiary">Histórico</p>
          <p className="text-body-sm font-semibold text-ink-primary mt-0.5">{Object.keys(logs).length} treinos</p>
        </button>
      </div>
    </div>
  );
}
