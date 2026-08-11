import React from "react";
import { getWeekKey, weekdayFromISO } from "../utils/dates.js";
import { Icon } from "./Icon.jsx";

export function MissaoAtiva({ plan, logs, weeks, date, engineResult }) {
  const dayKeyHoje = weekdayFromISO(date);
  const infoHoje = plan[dayKeyHoje];
  const treinouHoje = logs[date] && logs[date].status === "completed";
  const weekKeyAtual = getWeekKey(date);
  const semanaAtual = weeks[weekKeyAtual];

  let missao;
  if (infoHoje && infoHoje.items && infoHoje.items.length > 0 && !treinouHoje) {
    missao = { titulo: "Diária", texto: "Complete seu treino planejado hoje (" + infoHoje.full + ")" };
  } else if (semanaAtual && semanaAtual.completedDays.length < semanaAtual.plannedDays.length) {
    missao = { titulo: "Semanal", texto: "Complete 100% dos treinos desta semana (" + semanaAtual.completedDays.length + "/" + semanaAtual.plannedDays.length + ")" };
  } else if (engineResult.streakAtual >= 1 && engineResult.streakAtual < 4) {
    missao = { titulo: "Especial", texto: "Mantenha streak por 4 semanas (atual: " + engineResult.streakAtual + ")" };
  } else {
    missao = { titulo: "Mensal", texto: "Melhore seu PR em 1 exercício" };
  }

  return (
    <div className="surface-1 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon name="target" size={15} className="text-amber-400" />
        <p className="text-[11px] text-amber-400 uppercase tracking-wide font-medium">Missão {missao.titulo}</p>
      </div>
      <p className="text-sm text-zinc-200">{missao.texto}</p>
    </div>
  );
}
