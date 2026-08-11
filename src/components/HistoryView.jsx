import React, { useState } from "react";
import { formatBR, formatShort } from "../utils/formatters.js";
import { LineChart } from "./LineChart.jsx";

export function HistoryView({ plan, allSessions, onStartWorkout }) {
  const [historyMetric, setHistoryMetric] = useState("volume");

  if (allSessions.length === 0) {
    return (
      <div className="px-4 pt-4">
        <div className="surface-1 rounded-2xl p-6 mt-3 text-center">
          <p className="text-sm font-semibold text-zinc-200">Nenhum treino registrado ainda</p>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">Seu histórico aparece aqui assim que você completar o primeiro treino.</p>
          {onStartWorkout && (
            <button onClick={onStartWorkout} className="press bg-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl mt-4">
              Iniciar treino
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setHistoryMetric("volume")}
          className={"press flex-1 py-2.5 rounded-xl text-xs font-semibold " + (historyMetric === "volume" ? "bg-rose-500 text-white" : "surface-1 text-zinc-400")}
        >
          Volume
        </button>
        <button
          onClick={() => setHistoryMetric("kcal")}
          className={"press flex-1 py-2.5 rounded-xl text-xs font-semibold " + (historyMetric === "kcal" ? "bg-rose-500 text-white" : "surface-1 text-zinc-400")}
        >
          Calorias
        </button>
      </div>
      <p className="text-xs text-zinc-500 mb-2 px-1">
        {historyMetric === "volume" ? "Volume total por sessão (últimas 10)" : "Calorias estimadas por sessão (últimas 10)"}
      </p>
      <div className="surface-1 rounded-2xl p-4 mb-4">
        <LineChart
          points={allSessions.slice(0, 10).reverse().map((r) => ({
            label: formatShort(r.date),
            value: historyMetric === "volume" ? r.volume : r.kcal,
          }))}
          color="#2dd4bf"
          unit={historyMetric === "volume" ? "kg total" : "kcal (est.)"}
        />
      </div>

      <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2 px-1">{allSessions.length} treinos registrados</p>
      <div className="surface-1 rounded-2xl overflow-hidden">
        {allSessions.map((r, i) => (
          <div key={r.date} className={"px-4 py-3 " + (i > 0 ? "border-t divider" : "")}>
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-semibold text-zinc-100">{formatBR(r.date)}</p>
              <p className="text-xs text-zinc-500">{plan[r.dayKey] ? plan[r.dayKey].muscle : ""}</p>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {r.status === "completed" ? "Completo" : "Parcial"} · volume {Math.round(r.volume)} kg · ~{Math.round(r.kcal)} kcal
              {r.caffeine === true ? " · cafeína" : ""}
              {r.cardio && r.cardio.did === true ? ` · ${r.cardio.type} ${r.cardio.minutes}min` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
