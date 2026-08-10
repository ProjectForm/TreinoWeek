import React from "react";
import { getWeekKey, weekdayFromISO } from "../utils/dates.js";

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mt-3">
      <p className="text-xs text-amber-400 uppercase tracking-wide">Missão {missao.titulo}</p>
      <p className="text-sm text-zinc-100 mt-1">{missao.texto}</p>
    </div>
  );
}
