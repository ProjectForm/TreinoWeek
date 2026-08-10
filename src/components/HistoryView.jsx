import React, { useState } from "react";
import { formatBR, formatShort } from "../utils/formatters.js";
import { LineChart } from "./LineChart.jsx";

export function HistoryView({ plan, allSessions }) {
  const [historyMetric, setHistoryMetric] = useState("volume");

  return (
    <div className="px-4 pt-4">
      {allSessions.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center mt-12">Nenhum treino salvo ainda. Registre o primeiro na aba Treino.</p>
      ) : (
        <div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setHistoryMetric("volume")}
              className={"flex-1 py-2 rounded-lg text-xs font-semibold " + (historyMetric === "volume" ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")}
            >
              Volume
            </button>
            <button
              onClick={() => setHistoryMetric("kcal")}
              className={"flex-1 py-2 rounded-lg text-xs font-semibold " + (historyMetric === "kcal" ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")}
            >
              Calorias
            </button>
          </div>
          <p className="text-xs text-zinc-500 mb-2">
            {historyMetric === "volume" ? "Volume total por sessão (últimas 10)" : "Calorias estimadas por sessão (últimas 10)"}
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4">
            <LineChart
              points={allSessions.slice(0, 10).reverse().map((r) => ({
                label: formatShort(r.date),
                value: historyMetric === "volume" ? r.volume : r.kcal,
              }))}
              color="#2dd4bf"
              unit={historyMetric === "volume" ? "kg total" : "kcal"}
            />
          </div>

          <p className="text-xs text-zinc-500 mb-2">{allSessions.length} treinos registrados</p>
          {allSessions.map((r) => (
            <div key={r.date} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-3 mb-2">
              <div className="flex justify-between">
                <p className="text-sm font-semibold text-zinc-100">{formatBR(r.date)}</p>
                <p className="text-xs text-zinc-500">{plan[r.dayKey] ? plan[r.dayKey].muscle : ""}</p>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {r.status === "completed" ? "✓ completo" : "parcial"} &middot; volume {Math.round(r.volume)} kg &middot; {Math.round(r.kcal)} kcal
                {r.caffeine === true ? " · cafeína" : ""}
                {r.cardio && r.cardio.did === true ? " · " + r.cardio.type + " " + r.cardio.minutes + "min" : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
