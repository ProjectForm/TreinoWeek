import React from "react";
import { DAYS } from "../constants/plan.js";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { formatBR, formatWeight, agoLabel } from "../utils/formatters.js";
import { weekdayFromISO } from "../utils/dates.js";
import { tonnageOf, sanitizeMinutes } from "../utils/stats.js";
import { WeightInput } from "./WeightInput.jsx";
import { RepsInput } from "./RepsInput.jsx";

export function WorkoutForm({ plan, workout }) {
  const {
    date, day, setDay, shiftDate,
    entries, caffeine, setCaffeine, cardio, setCardio,
    updateSet, addSet, removeSet, repeatPrevious, previousSameDay, lastByExercise,
    groupVolumesLive, totalTonnage, musculKcalInfo, cardioKcal, totalKcal,
    saving, msg, save,
  } = workout;

  const info = plan[day] || { items: [], muscle: "", full: "" };
  const mismatch = weekdayFromISO(date) !== day;

  return (
    <div className="px-4 pt-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((k) => (
          <button
            key={k}
            onClick={() => setDay(k)}
            className={
              "px-3 py-2 rounded-lg text-sm font-semibold border " +
              (day === k ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-900 text-zinc-400 border-zinc-800")
            }
          >
            {(plan[k] && plan[k].label) || k}
          </button>
        ))}
      </div>
      <p className="text-sm text-zinc-500 mt-2">{info.muscle}</p>

      <div className="flex items-center gap-2 mt-3 bg-zinc-900 border border-zinc-800 rounded-lg p-2">
        <button onClick={() => shiftDate(-1)} className="px-3 py-1 text-zinc-400 text-lg">&#8249;</button>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && workout.setDate(e.target.value)}
          className="flex-1 bg-zinc-900 text-zinc-100 text-sm text-center outline-none"
        />
        <button onClick={() => shiftDate(1)} className="px-3 py-1 text-zinc-400 text-lg">&#8250;</button>
      </div>
      {mismatch && (
        <p className="text-xs text-amber-400 mt-2">Atenção: {formatBR(date)} não cai em {info.full.toLowerCase()}.</p>
      )}

      {info.items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-zinc-300">Dia de descanso</p>
          <p className="text-sm text-zinc-500 mt-1">Nada programado para quinta.</p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3">
            <p className="text-sm text-zinc-300 font-semibold">Tomou cafeína antes do treino?</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setCaffeine(true)}
                className={
                  "flex-1 py-2 rounded-lg text-sm font-semibold border " +
                  (caffeine === true ? "bg-amber-500 text-zinc-900 border-amber-500" : "bg-zinc-950 text-zinc-400 border-zinc-800")
                }
              >
                Sim
              </button>
              <button
                onClick={() => setCaffeine(false)}
                className={
                  "flex-1 py-2 rounded-lg text-sm font-semibold border " +
                  (caffeine === false ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-950 text-zinc-400 border-zinc-800")
                }
              >
                Não
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3">
            <p className="text-sm text-zinc-300 font-semibold">Fez cardio hoje?</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setCardio((prev) => ({ ...prev, did: true }))}
                className={
                  "flex-1 py-2 rounded-lg text-sm font-semibold border " +
                  (cardio.did === true ? "bg-teal-500 text-zinc-900 border-teal-500" : "bg-zinc-950 text-zinc-400 border-zinc-800")
                }
              >
                Sim
              </button>
              <button
                onClick={() => setCardio((prev) => ({ ...prev, did: false }))}
                className={
                  "flex-1 py-2 rounded-lg text-sm font-semibold border " +
                  (cardio.did === false ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-950 text-zinc-400 border-zinc-800")
                }
              >
                Não
              </button>
            </div>
            {cardio.did === true && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCardio((prev) => ({ ...prev, type: "caminhada" }))}
                    className={
                      "flex-1 py-2 rounded-lg text-xs font-semibold border " +
                      (cardio.type === "caminhada" ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-950 text-zinc-400 border-zinc-800")
                    }
                  >
                    Caminhada
                  </button>
                  <button
                    onClick={() => setCardio((prev) => ({ ...prev, type: "bicicleta" }))}
                    className={
                      "flex-1 py-2 rounded-lg text-xs font-semibold border " +
                      (cardio.type === "bicicleta" ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-950 text-zinc-400 border-zinc-800")
                    }
                  >
                    Bicicleta
                  </button>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="minutos"
                  value={cardio.minutes}
                  onChange={(e) => setCardio((prev) => ({ ...prev, minutes: sanitizeMinutes(e.target.value) }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 outline-none"
                />
                <div className="flex gap-2">
                  {["leve", "moderada", "forte"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setCardio((prev) => ({ ...prev, intensity: lvl }))}
                      className={
                        "flex-1 py-2 rounded-lg text-xs font-semibold capitalize border " +
                        (cardio.intensity === lvl ? "bg-teal-500 text-zinc-900 border-teal-500" : "bg-zinc-950 text-zinc-400 border-zinc-800")
                      }
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {previousSameDay && (
            <button onClick={repeatPrevious} className="w-full mb-3 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-semibold py-3 rounded-xl">
              Repetir treino de {formatBR(previousSameDay)} ({agoLabel(previousSameDay, date)})
            </button>
          )}

          {info.items.map((item) => {
            const ex = DEFAULT_EXERCISES[item.id];
            const sets = entries[item.id] || [];
            const last = lastByExercise[item.id];
            const exTonnage = tonnageOf(sets);
            return (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-zinc-100">{ex.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{ex.muscle} &middot; meta {item.sets}x{item.reps}</p>
                  </div>
                  {exTonnage > 0 && <p className="text-xs text-teal-400 font-medium shrink-0">{formatWeight(exTonnage)}</p>}
                </div>

                {last && (
                  <div className="mt-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-teal-400">
                      Último treino ({agoLabel(last.date, date)}): máx {last.max} kg
                      {last.caffeine === true ? " · com cafeína" : ""}
                      {last.caffeine === false ? " · sem cafeína" : ""}
                    </p>
                    {last.sets && last.sets.length > 0 && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {last.sets.map((s) => s.weight + "kg x " + (s.reps || "-")).join("   ")}
                      </p>
                    )}
                    {last.baseline && (
                      <p className="text-xs text-zinc-600 mt-1">
                        Média (últimas {last.baseline.count} sessões): {last.baseline.avgMax.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3">
                  {sets.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-zinc-500 w-4">{i + 1}</span>
                      <WeightInput value={s.weight} onChange={(v) => updateSet(item.id, i, "weight", v)} />
                      <RepsInput value={s.reps} onChange={(v) => updateSet(item.id, i, "reps", v)} />
                      <button onClick={() => removeSet(item.id, i)} className="px-2 py-1 text-zinc-600 text-lg shrink-0">&minus;</button>
                    </div>
                  ))}
                  <button onClick={() => addSet(item.id)} className="text-xs text-zinc-400 mt-1">+ adicionar série</button>
                </div>
              </div>
            );
          })}

          {totalTonnage > 0 && (
            <div className="bg-zinc-900 border border-rose-900 rounded-xl p-3 mb-3">
              <p className="text-sm font-semibold text-zinc-100">Resumo do esforço de hoje</p>
              <p className="text-xs text-zinc-500 mt-1">Volume total levantado: {formatWeight(totalTonnage)}</p>
              <div className="mt-2 space-y-1">
                {GROUP_ORDER.filter((g) => groupVolumesLive[g] > 0)
                  .sort((a, b) => groupVolumesLive[b] - groupVolumesLive[a])
                  .map((g) => (
                    <div key={g} className="flex justify-between text-xs">
                      <span className="text-zinc-400">{g}</span>
                      <span className="text-zinc-200 font-medium">{formatWeight(groupVolumesLive[g])}</span>
                    </div>
                  ))}
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Musculação (~{Math.round(musculKcalInfo.durationMin)} min)</span>
                  <span>{Math.round(musculKcalInfo.kcal)} kcal</span>
                </div>
                {cardio.did === true && (
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Cardio ({cardio.type}, {cardio.minutes || 0} min, {cardio.intensity})</span>
                    <span>{Math.round(cardioKcal)} kcal</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-rose-400 font-semibold pt-1">
                  <span>Total estimado</span>
                  <span>{Math.round(totalKcal)} kcal</span>
                </div>
              </div>
              <p className="text-xs text-zinc-600 mt-2">
                Estimativa aproximada baseada no seu perfil (aba Perfil) e em valores médios de MET. Consumo real varia.
              </p>
            </div>
          )}

          <button onClick={save} disabled={saving} className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl mt-2">
            {saving ? "Salvando..." : "Salvar treino do dia"}
          </button>
          {msg === "copiado" && <p className="text-center text-sm text-teal-400 mt-2">Campos preenchidos com o treino anterior. Ajuste as cargas e salve.</p>}
          {msg === "erro" && <p className="text-center text-sm text-rose-400 mt-2">Não deu para salvar. Tente novamente.</p>}
        </div>
      )}
    </div>
  );
}
