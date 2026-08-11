import React, { useState, useMemo } from "react";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { formatBR, formatShort, formatWeight, formatSet } from "../utils/formatters.js";
import { effectiveWeight } from "../utils/stats.js";
import { LineChart } from "./LineChart.jsx";

const METRICS = [
  ["volume", "Volume Total"],
  ["max", "Carga Máxima"],
  ["kcal", "Calorias"],
];

export function ProgressView({ logs, exerciseHistory, engineResult }) {
  const [metric, setMetric] = useState("volume");
  const [showExercicio, setShowExercicio] = useState(false);
  const [chartEx, setChartEx] = useState("supino_maquina");
  const [exMetric, setExMetric] = useState("max");

  // ---- Evolução geral (todos os exercícios, por dia) ----
  const dailyProgress = useMemo(() => {
    return Object.keys(logs)
      .filter((d) => logs[d].status !== "skipped")
      .sort()
      .map((d) => {
        const data = logs[d];
        let maxWeight = 0, totalVolume = 0;
        Object.keys(data.exercises || {}).forEach((id) => {
          const sets = data.exercises[id].sets || [];
          sets.forEach((s) => {
            const w = effectiveWeight(s);
            const r = parseFloat(s.reps) || 0;
            if (w > maxWeight) maxWeight = w;
            totalVolume += w * r;
          });
        });
        return { date: d, volume: totalVolume, maxWeight, kcal: data.kcal || 0 };
      });
  }, [logs]);

  const last30 = dailyProgress.slice(-30);
  const chartPoints = last30.map((d) => ({
    label: formatShort(d.date),
    value: metric === "volume" ? d.volume : metric === "max" ? d.maxWeight : d.kcal,
  }));

  const recentPRs = useMemo(() => {
    const all = [];
    Object.keys(engineResult?.narrativesByDate || {}).forEach((date) => {
      (engineResult.narrativesByDate[date] || []).forEach((n) => {
        if (n.type === "pr") all.push({ date, exId: n.exId, novo: n.novo, anterior: n.novo - n.delta });
      });
    });
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [engineResult]);

  const mediaVolumePorTreino = engineResult && engineResult.totalTreinosCompletos > 0
    ? engineResult.volumeVidaToda / engineResult.totalTreinosCompletos
    : 0;

  // ---- Exercício específico (secundário) ----
  const series = useMemo(() => {
    return (exerciseHistory[chartEx] || []).map((h) => ({
      date: h.date, max: h.max, volume: h.volume,
      sets: logs[h.date] && logs[h.date].exercises[chartEx] ? logs[h.date].exercises[chartEx].sets.filter((s) => effectiveWeight(s) > 0) : [],
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
      <div className="flex gap-2">
        {METRICS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={"flex-1 py-2 rounded-lg text-xs font-semibold " + (metric === key ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")}
          >
            {label}
          </button>
        ))}
      </div>

      {chartPoints.length < 2 ? (
        <p className="text-sm text-zinc-500 text-center mt-12">Registre pelo menos dois treinos para ver a evolução geral.</p>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mt-3">
          <LineChart
            points={chartPoints}
            color="#2dd4bf"
            unit={metric === "volume" ? "kg total" : metric === "max" ? "kg" : "kcal"}
          />
          <p className="text-xs text-zinc-600 mt-1">Últimos {chartPoints.length} treinos</p>
        </div>
      )}

      {engineResult && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500">Volume acumulado</p>
            <p className="text-lg font-bold text-zinc-100 mt-1">{formatWeight(engineResult.volumeVidaToda)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500">Carga máxima (PR)</p>
            <p className="text-lg font-bold text-zinc-100 mt-1">{Math.round(engineResult.maxCargaGeral)} kg</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500">Média por treino</p>
            <p className="text-lg font-bold text-zinc-100 mt-1">{formatWeight(mediaVolumePorTreino)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500">Treinos completos</p>
            <p className="text-lg font-bold text-zinc-100 mt-1">{engineResult.totalTreinosCompletos}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500">Streak atual</p>
            <p className="text-lg font-bold text-teal-400 mt-1">{engineResult.streakAtual} semanas</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500">Semanas perfeitas</p>
            <p className="text-lg font-bold text-zinc-100 mt-1">{engineResult.semanasPerfeitasTotal}</p>
          </div>
        </div>
      )}

      {recentPRs.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-zinc-500 mb-2">PRs recentes</p>
          {recentPRs.map((pr, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 mb-1.5 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-100">{DEFAULT_EXERCISES[pr.exId] ? DEFAULT_EXERCISES[pr.exId].name : pr.exId}</p>
                <p className="text-xs text-zinc-500">{formatBR(pr.date)}</p>
              </div>
              <p className="text-sm text-teal-400 font-semibold">{pr.anterior.toFixed(1)} → {pr.novo.toFixed(1)} kg</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowExercicio((v) => !v)}
        className="w-full mt-4 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm py-3 rounded-xl"
      >
        {showExercicio ? "Ocultar" : "Ver"} exercício específico
      </button>

      {showExercicio && (
        <div className="mt-3">
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
              onClick={() => setExMetric("max")}
              className={"flex-1 py-2 rounded-lg text-xs font-semibold " + (exMetric === "max" ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")}
            >
              Carga máxima
            </button>
            <button
              onClick={() => setExMetric("volume")}
              className={"flex-1 py-2 rounded-lg text-xs font-semibold " + (exMetric === "volume" ? "bg-rose-500 text-white" : "bg-zinc-900 text-zinc-400")}
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
                  points={series.slice(-10).map((r) => ({ label: formatShort(r.date), value: exMetric === "max" ? r.max : r.volume }))}
                  color="#fb7185"
                  unit={exMetric === "max" ? "kg" : "kg total"}
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
                  <p className="text-sm text-zinc-100 mt-1">{r.sets.map((s) => formatSet(s)).join("   ")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
