import React, { useState, useMemo } from "react";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { formatBR, formatShort } from "../utils/formatters.js";
import { LineChart } from "./LineChart.jsx";

export function ProgressView({ logs, exerciseHistory }) {
  const [chartEx, setChartEx] = useState("supino_maquina");
  const [metric, setMetric] = useState("max");

  const series = useMemo(() => {
    return (exerciseHistory[chartEx] || []).map((h) => ({
      date: h.date, max: h.max, volume: h.volume,
      sets: logs[h.date] && logs[h.date].exercises[chartEx] ? logs[h.date].exercises[chartEx].sets.filter((s) => parseFloat(s.weight) > 0) : [],
      caffeine: logs[h.date] ? logs[h.date].caffeine : null,
    }));
  }, [exerciseHistory, chartEx, logs]);

  const caffeineCompare = useMemo(() => {
    const withC = series.filter((r) => r.caffeine === true);
    const without = series.filter((r) => r.caffeine === false);
    if (withC.length < 2 || without.length < 2) return null;
    const avg = (arr, k) => arr.reduce((a, r) => a + r[k], 0) / arr.length;
    return { withMax: avg(withC, "max"), withoutMax: avg(without, "max"), withN: withC.length, withoutN: without.length };
  }, [series]);

  return (
    <div className="px-4 pt-4">
      <label className="text-xs text-zinc-500">Exercício</label>
      <select
        value={chartEx}
        onChange={(e) => setChartEx(e.target.value)}
        className="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-3 text-sm text-zinc-100 outline-none"
      >
        {Object.keys(DEFAULT_EXERCISES).map((id) => (
          <option key={id} value={id}>{DEFAULT_EXERCISES[id].name}</option>
        ))}
      </select>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setMetric("max")}
          className={"flex-1 py-2 rounded-lg text-xs font-semibold " + (metric === "max" ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")}
        >
          Carga máxima
        </button>
        <button
          onClick={() => setMetric("volume")}
          className={"flex-1 py-2 rounded-lg text-xs font-semibold " + (metric === "volume" ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")}
        >
          Volume total
        </button>
      </div>

      {series.length < 2 ? (
        <p className="text-sm text-zinc-500 text-center mt-12">Registre pelo menos duas sessões deste exercício para ver o gráfico.</p>
      ) : (
        <div className="mt-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <LineChart
              points={series.slice(-10).map((r) => ({ label: formatShort(r.date), value: metric === "max" ? r.max : r.volume }))}
              color="#fb7185"
              unit={metric === "max" ? "kg" : "kg total"}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Recorde de carga</p>
              <p className="text-xl font-bold text-zinc-100 mt-1">{Math.max.apply(null, series.map((r) => r.max))} kg</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Sessões</p>
              <p className="text-xl font-bold text-zinc-100 mt-1">{series.length}</p>
            </div>
          </div>

          {caffeineCompare && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mt-3">
              <p className="text-sm font-semibold text-zinc-200">Cafeína x carga</p>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-xs text-amber-400">Com cafeína ({caffeineCompare.withN}x)</p>
                  <p className="text-lg font-bold text-zinc-100">{caffeineCompare.withMax.toFixed(1)} kg</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Sem cafeína ({caffeineCompare.withoutN}x)</p>
                  <p className="text-lg font-bold text-zinc-100">{caffeineCompare.withoutMax.toFixed(1)} kg</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Média da carga máxima. Muitos fatores afetam força (sono, alimentação, recuperação), então trate isso como observação, não conclusão.
              </p>
            </div>
          )}

          <p className="text-xs text-zinc-500 mt-5 mb-2">Detalhe das séries</p>
          {series.slice().reverse().map((r) => (
            <div key={r.date} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 mb-2">
              <div className="flex justify-between">
                <p className="text-xs text-zinc-500">{formatBR(r.date)}</p>
                {r.caffeine === true && <p className="text-xs text-amber-400">cafeína</p>}
              </div>
              <p className="text-sm text-zinc-100 mt-1">{r.sets.map((s) => s.weight + "kg x " + (s.reps || "-")).join("   ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
