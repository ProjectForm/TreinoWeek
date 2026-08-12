import React, { useState, useMemo } from "react";
import { GROUP_ORDER, GROUP_TO_MUSCLES, DEFAULT_MUSCLE_BREAKDOWN } from "../constants/muscleBreakdown.js";
import { computeMuscleVolumes } from "../utils/muscles.js";
import { formatWeight } from "../utils/formatters.js";
import { toISO, todayISO } from "../utils/dates.js";
import { Icon } from "./Icon.jsx";

const GROUP_ICONS = {
  "Braços": "dumbbell",
  "Peitoral": "target",
  "Costas": "chart",
  "Pernas": "flame",
  "Core": "shield",
  "Ombros": "user",
};

function daysBeforeISO(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() - n);
  return toISO(d);
}

// Painel de sub-músculos em accordion (estilo Configurações do iOS). Volume
// mensal e frequência semanal são recomputados a partir dos logs — não
// exigem nenhum campo novo salvo, só o que já existe (data.exercises).
export function MuscleAccordion({ musculos, subMusculos, logs, bonusEquilibrioAtivo, onSelectMuscle }) {
  const [openGroup, setOpenGroup] = useState(null);
  const treinados = Object.values(musculos).filter((v) => v.xp > 0).length;

  const { volumeMes, treinosSemana } = useMemo(() => {
    const today = todayISO();
    const monthAgo = daysBeforeISO(today, 30);
    const weekAgo = daysBeforeISO(today, 7);
    const volumeMes = {};
    const treinosSemana = {};

    Object.keys(logs).forEach((date) => {
      if (date < monthAgo || date > today) return;
      const data = logs[date];
      if (!data || data.status === "skipped") return;
      const entriesFlat = {};
      Object.keys(data.exercises || {}).forEach((id) => { entriesFlat[id] = data.exercises[id].sets || []; });
      const muscleVol = computeMuscleVolumes(entriesFlat, DEFAULT_MUSCLE_BREAKDOWN);
      Object.entries(muscleVol).forEach(([m, v]) => {
        if (v <= 0) return;
        volumeMes[m] = (volumeMes[m] || 0) + v;
        if (date >= weekAgo) {
          treinosSemana[m] = treinosSemana[m] || new Set();
          treinosSemana[m].add(date);
        }
      });
    });
    return { volumeMes, treinosSemana };
  }, [logs]);

  return (
    <div className="surface-1 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium">Grupos musculares</p>
        {bonusEquilibrioAtivo && <p className="text-[11px] text-teal-400 font-medium">+10% equilíbrio</p>}
      </div>
      <p className="text-[11px] text-zinc-600 px-4 pb-3">{treinados}/{GROUP_ORDER.length} grupos com XP registrado — treine todos ao menos uma vez</p>

      {GROUP_ORDER.map((g, i) => {
        const subMuscles = GROUP_TO_MUSCLES[g] || [];
        const expandable = subMuscles.length > 1;
        const open = openGroup === g;
        const groupLevel = (musculos[g] && musculos[g].nivel) || 0;
        const maxSibling = Math.max(0, ...subMuscles.map((m) => volumeMes[m] || 0));

        return (
          <div key={g} className={i > 0 ? "border-t divider" : ""}>
            <button
              onClick={() => {
                if (expandable) setOpenGroup(open ? null : g);
                else if (subMuscles.length === 1) onSelectMuscle(subMuscles[0]);
              }}
              aria-expanded={expandable ? open : undefined}
              className="w-full flex items-center justify-between px-4 py-3 press"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full surface-2 flex items-center justify-center text-zinc-400 shrink-0">
                  <Icon name={GROUP_ICONS[g] || "target"} size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-zinc-200">{g}</p>
                  <p className="text-xs text-zinc-500">Nv. {groupLevel}</p>
                </div>
              </div>
              {expandable && (
                <Icon
                  name="chevronRight"
                  size={16}
                  className={"text-zinc-500 shrink-0 transition-transform duration-300 " + (open ? "rotate-90" : "")}
                />
              )}
            </button>

            {expandable && (
              <div
                className="overflow-hidden transition-[max-height] ease-out"
                style={{ maxHeight: open ? subMuscles.length * 84 + 16 : 0, transitionDuration: "300ms" }}
              >
                <div className="px-4 pb-3 space-y-3">
                  {subMuscles.map((m) => {
                    const vol = volumeMes[m] || 0;
                    const sessions = (treinosSemana[m] || new Set()).size;
                    const pct = maxSibling > 0 ? Math.round((vol / maxSibling) * 100) : 0;
                    const barColor = sessions >= 2 ? "bg-teal-400" : sessions === 1 ? "bg-amber-400" : "bg-zinc-700";
                    const level = (subMusculos[m] && subMusculos[m].nivel) || 0;
                    return (
                      <button
                        key={m}
                        onClick={() => onSelectMuscle(m)}
                        className="w-full text-left press"
                        aria-label={`${m}, nível ${level}, ${sessions} treino${sessions === 1 ? "" : "s"} essa semana, ${formatWeight(vol)} este mês`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-300">{m}</span>
                          <span className="text-[11px] text-zinc-500">
                            {sessions} treino{sessions === 1 ? "" : "s"} · sem.
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-1.5" aria-hidden="true">
                          <div className={"h-1.5 rounded-full transition-all " + barColor} style={{ width: pct + "%" }} />
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-0.5">Nv. {level} · {formatWeight(vol)} este mês</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
