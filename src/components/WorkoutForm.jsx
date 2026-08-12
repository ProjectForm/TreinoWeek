import React, { useState, useEffect } from "react";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { DEFAULT_REST_SECONDS } from "../constants/config.js";
import { formatBR, formatWeight, agoLabel, formatSet } from "../utils/formatters.js";
import { tonnageOf, sanitizeMinutes } from "../utils/stats.js";
import { WeightInput } from "./WeightInput.jsx";
import { RepsInput } from "./RepsInput.jsx";
import { WeekStrip } from "./WeekStrip.jsx";
import { RestTimer } from "./RestTimer.jsx";
import { Icon } from "./Icon.jsx";
import { Switch } from "./Switch.jsx";

// Unilateral agora é uma escolha por sessão (guardada no formato do próprio
// set — weightD presente ou não), então essas funções recebem um boolean já
// resolvido em vez de olhar item.unilateral (que só serve como sugestão
// inicial do plano).
function isSetComplete(unilateral, s) {
  if (!s) return false;
  const w = parseFloat(s.weight) > 0;
  const r = parseFloat(s.reps) > 0;
  if (!unilateral) return w && r;
  return w && parseFloat(s.weightD) > 0 && r;
}

function isUnilateralNow(item, sets) {
  if (sets && sets.length > 0) return sets[0].weightD !== undefined;
  return !!item.unilateral;
}

function ToggleBtn({ active, onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-1 py-2.5 rounded-xl text-sm font-semibold press " +
        className + " " +
        (active ? "bg-rose-500 text-white" : "surface-2 text-zinc-400")
      }
    >
      {children}
    </button>
  );
}

export function WorkoutForm({ plan, workout }) {
  const {
    date, setDate, day, logs,
    entries, caffeine, setCaffeine, cardio, setCardio,
    updateSet, addSet, removeSet, setExerciseUnilateral, repeatPrevious, repeatExercise, previousSameDay, lastByExercise,
    groupVolumesLive, totalTonnage, musculKcalInfo, cardioKcal, totalKcal,
    saving, msg, save,
  } = workout;

  const info = plan[day] || { items: [], muscle: "", full: "" };

  const [expandedOverrides, setExpandedOverrides] = useState({});
  const [setupOpen, setSetupOpen] = useState(false);
  const [rest, setRest] = useState(null); // { total, secondsLeft }
  const [autoFilled, setAutoFilled] = useState(() => new Set());

  useEffect(() => {
    setExpandedOverrides({});
    setAutoFilled(new Set());
  }, [date]);

  function handleRepeatExercise(item) {
    const ok = repeatExercise(item.id);
    if (!ok) return;
    const hist = lastByExercise[item.id];
    setAutoFilled((prev) => {
      const next = new Set(prev);
      (hist.sets || []).forEach((_, idx) => next.add(item.id + ":" + idx));
      return next;
    });
    // Mantém expandido mesmo que o preenchimento automático já complete todas
    // as séries — senão o exercício colapsaria na hora, escondendo os badges
    // "auto" bem no momento em que o usuário precisa revisar antes de confirmar.
    setExpandedOverrides((prev) => ({ ...prev, [item.id]: true }));
  }

  useEffect(() => {
    if (!rest) return;
    if (rest.secondsLeft <= 0) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(200); } catch (e) {}
      }
      setRest(null);
      return;
    }
    const t = setTimeout(() => setRest((r) => r && { ...r, secondsLeft: r.secondsLeft - 1 }), 1000);
    return () => clearTimeout(t);
  }, [rest]);

  function handleSetChange(item, unilateral, idx, field, value) {
    const before = (entries[item.id] || [])[idx] || {};
    const after = { ...before, [field]: value };
    const wasComplete = isSetComplete(unilateral, before);
    const nowComplete = isSetComplete(unilateral, after);
    updateSet(item.id, idx, field, value);

    const autoKey = item.id + ":" + idx;
    if (autoFilled.has(autoKey)) {
      setAutoFilled((prev) => {
        const next = new Set(prev);
        next.delete(autoKey);
        return next;
      });
    }

    if (!wasComplete && nowComplete) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(25); } catch (e) {}
      }
      setRest({ total: DEFAULT_REST_SECONDS, secondsLeft: DEFAULT_REST_SECONDS });
    }
  }

  function toggleExpanded(id, defaultVal) {
    setExpandedOverrides((prev) => ({ ...prev, [id]: prev[id] === undefined ? !defaultVal : !prev[id] }));
  }

  const focusItem = info.items.find((item) => {
    const sets = entries[item.id] || [];
    const unilateral = isUnilateralNow(item, sets);
    return !(sets.length > 0 && sets.every((s) => isSetComplete(unilateral, s)));
  });
  const focusId = focusItem ? focusItem.id : null;

  const cardioSummary = cardio.did === true ? `Cardio ${cardio.type}` : cardio.did === false ? "Sem cardio" : "Cardio";
  const caffeineSummary = caffeine === null ? "Cafeína" : caffeine ? "Com cafeína" : "Sem cafeína";

  return (
    <div className="px-4 pt-4 pb-6">
      <WeekStrip date={date} plan={plan} logs={logs} onSelectDate={setDate} />
      <p className="text-sm text-zinc-400 mt-3">{info.muscle || "Dia de descanso"}</p>

      {info.items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-zinc-300">Dia de descanso</p>
          <p className="text-sm text-zinc-500 mt-1">Sem treino planejado para hoje. Aproveite para recuperar.</p>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => setSetupOpen((v) => !v)}
            className="w-full flex items-center justify-between surface-1 rounded-2xl px-4 py-3 mb-3 press"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-zinc-200">Antes de começar</p>
              <p className="text-xs text-zinc-500 mt-0.5">{caffeineSummary} · {cardioSummary}</p>
            </div>
            <Icon name="chevronRight" size={18} className={"text-zinc-500 transition-transform " + (setupOpen ? "rotate-90" : "")} />
          </button>

          {setupOpen && (
            <div className="surface-1 rounded-2xl p-4 mb-3 space-y-4 animate-fadeIn">
              <div>
                <p className="text-sm text-zinc-300 font-medium mb-2">Tomou cafeína antes do treino?</p>
                <div className="flex gap-2">
                  <ToggleBtn active={caffeine === true} onClick={() => setCaffeine(true)}>Sim</ToggleBtn>
                  <ToggleBtn active={caffeine === false} onClick={() => setCaffeine(false)}>Não</ToggleBtn>
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-medium mb-2">Fez cardio hoje?</p>
                <div className="flex gap-2">
                  <ToggleBtn active={cardio.did === true} onClick={() => setCardio((prev) => ({ ...prev, did: true }))}>Sim</ToggleBtn>
                  <ToggleBtn active={cardio.did === false} onClick={() => setCardio((prev) => ({ ...prev, did: false }))}>Não</ToggleBtn>
                </div>
                {cardio.did === true && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <ToggleBtn active={cardio.type === "caminhada"} onClick={() => setCardio((prev) => ({ ...prev, type: "caminhada" }))}>Caminhada</ToggleBtn>
                      <ToggleBtn active={cardio.type === "bicicleta"} onClick={() => setCardio((prev) => ({ ...prev, type: "bicicleta" }))}>Bicicleta</ToggleBtn>
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="minutos"
                      value={cardio.minutes}
                      onChange={(e) => setCardio((prev) => ({ ...prev, minutes: sanitizeMinutes(e.target.value) }))}
                      className="w-full surface-2 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
                    />
                    <div className="flex gap-2">
                      {["leve", "moderada", "forte"].map((lvl) => (
                        <ToggleBtn key={lvl} active={cardio.intensity === lvl} onClick={() => setCardio((prev) => ({ ...prev, intensity: lvl }))} className="capitalize">
                          {lvl}
                        </ToggleBtn>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {previousSameDay && (
            <button onClick={repeatPrevious} className="press w-full mb-3 surface-2 text-zinc-100 text-sm font-semibold py-3 rounded-2xl flex items-center justify-center gap-2">
              <Icon name="clock" size={15} className="text-zinc-500" />
              Repetir último treino
              <span className="text-zinc-500 font-normal">· {formatBR(previousSameDay)}</span>
            </button>
          )}

          {info.items.map((item) => {
            const ex = DEFAULT_EXERCISES[item.id];
            const sets = entries[item.id] || [];
            const unilateral = isUnilateralNow(item, sets);
            const last = lastByExercise[item.id];
            const exTonnage = tonnageOf(sets);
            const doneCount = sets.filter((s) => isSetComplete(unilateral, s)).length;
            const complete = sets.length > 0 && doneCount === sets.length;
            const isFocus = item.id === focusId;
            const expanded = expandedOverrides[item.id] !== undefined ? expandedOverrides[item.id] : isFocus;

            if (!expanded) {
              return (
                <button
                  key={item.id}
                  onClick={() => toggleExpanded(item.id, isFocus)}
                  className="w-full flex items-center justify-between surface-1 rounded-2xl px-4 py-3 mb-2 press text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {complete ? (
                      <Icon name="checkCircle" size={19} className="text-teal-400 shrink-0" />
                    ) : (
                      <span className="w-[18px] h-[18px] rounded-full border-2 border-zinc-700 shrink-0" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{ex.name}</p>
                      <p className="text-xs text-zinc-500">
                        {doneCount}/{sets.length} séries{exTonnage > 0 ? " · " + formatWeight(exTonnage) : ""}
                      </p>
                    </div>
                  </div>
                  <Icon name="chevronRight" size={16} className="text-zinc-500 shrink-0" />
                </button>
              );
            }

            return (
              <div key={item.id} className="surface-1 rounded-2xl p-4 mb-2">
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => toggleExpanded(item.id, isFocus)} className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-zinc-100">{ex.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{ex.muscle} · meta {item.sets}×{item.reps}</p>
                  </button>
                  {exTonnage > 0 && <p className="text-xs text-teal-400 font-medium shrink-0">{formatWeight(exTonnage)}</p>}
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 surface-2 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-zinc-300">Unilateral (E/D)</span>
                  <Switch
                    checked={unilateral}
                    onChange={(next) => setExerciseUnilateral(item.id, next)}
                    label={`Registrar ${ex.name} como unilateral, com peso esquerdo e direito separados`}
                  />
                </div>

                {last ? (
                  <div className="mt-2 surface-2 rounded-xl px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-zinc-400">
                        Último treino ({agoLabel(last.date, date)}) · máx {last.max} kg
                        {last.caffeine === true ? " · com cafeína" : ""}
                        {last.caffeine === false ? " · sem cafeína" : ""}
                      </p>
                      <button
                        onClick={() => handleRepeatExercise(item)}
                        className="press shrink-0 flex items-center gap-1 bg-zinc-800 text-zinc-200 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                      >
                        <Icon name="clock" size={12} />
                        Repetir último
                      </button>
                    </div>
                    {last.sets && last.sets.length > 0 && (
                      <p className="text-xs text-zinc-500 mt-1">{last.sets.map((s) => formatSet(s)).join("   ")}</p>
                    )}
                    {last.baseline && (
                      <p className="text-xs text-zinc-500 mt-1">Média (últimas {last.baseline.count}): {last.baseline.avgMax.toFixed(1)} kg</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2 surface-2 rounded-xl px-3 py-2.5 opacity-50">
                    <button disabled aria-disabled="true" className="flex items-center gap-1 bg-zinc-800 text-zinc-400 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg">
                      <Icon name="clock" size={12} />
                      Repetir último
                    </button>
                    <p className="text-[11px] text-zinc-500">Primeiro treino detectado</p>
                  </div>
                )}

                <div className="mt-3 space-y-1">
                  {sets.map((s, i) => {
                    const done = isSetComplete(unilateral, s);
                    const isAuto = autoFilled.has(item.id + ":" + i);
                    return (
                      <div key={i} className={"rounded-xl px-1.5 py-1.5 " + (done ? "bg-teal-400/[0.06]" : "")}>
                        {unilateral ? (
                          <div className="flex items-center gap-1 w-full">
                            <span className="text-xs text-zinc-500 w-4 shrink-0">{i + 1}</span>
                            <span className="text-[10px] text-zinc-500 shrink-0">E</span>
                            <WeightInput value={s.weight} onChange={(v) => handleSetChange(item, unilateral, i, "weight", v)} />
                            <span className="text-[10px] text-zinc-500 shrink-0">D</span>
                            <WeightInput value={s.weightD} onChange={(v) => handleSetChange(item, unilateral, i, "weightD", v)} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 w-full">
                            <span className="text-xs text-zinc-500 w-4 shrink-0">{i + 1}</span>
                            <WeightInput value={s.weight} onChange={(v) => handleSetChange(item, unilateral, i, "weight", v)} />
                          </div>
                        )}
                        <div className="flex items-center gap-1 w-full mt-1 pl-5">
                          <RepsInput value={s.reps} onChange={(v) => handleSetChange(item, unilateral, i, "reps", v)} />
                          {isAuto && (
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 rounded px-1 py-0.5 shrink-0" title="Preenchido automaticamente pelo 'Repetir último'">
                              auto
                            </span>
                          )}
                          {done ? (
                            <Icon name="checkCircle" size={16} className="text-teal-400 shrink-0" />
                          ) : (
                            <span className="w-4 shrink-0" aria-hidden="true" />
                          )}
                          <button
                            onClick={() => {
                              removeSet(item.id, i);
                              setAutoFilled((prev) => {
                                let changed = false;
                                const next = new Set();
                                prev.forEach((key) => { if (key.startsWith(item.id + ":")) changed = true; else next.add(key); });
                                return changed ? next : prev;
                              });
                            }}
                            aria-label={`Remover série ${i + 1}`}
                            className="ml-auto px-2 text-zinc-500 text-xs shrink-0"
                          >
                            remover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => addSet(item.id)} className="text-xs text-zinc-400 press pl-1.5">+ adicionar série</button>
                </div>
              </div>
            );
          })}

          {totalTonnage > 0 && (
            <div className="surface-1 rounded-2xl p-4 mt-2 mb-3">
              <p className="text-sm font-semibold text-zinc-100">Resumo do esforço</p>
              <p className="text-xs text-zinc-500 mt-1">Volume total: {formatWeight(totalTonnage)}</p>
              <div className="mt-2 space-y-1">
                {GROUP_ORDER.filter((g) => groupVolumesLive[g] > 0)
                  .sort((a, b) => groupVolumesLive[b] - groupVolumesLive[a])
                  .map((g) => (
                    <div key={g} className="flex justify-between text-xs">
                      <span className="text-zinc-400">{g}</span>
                      <span className="text-zinc-300 font-medium">{formatWeight(groupVolumesLive[g])}</span>
                    </div>
                  ))}
              </div>
              <div className="mt-3 pt-3 border-t divider space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Musculação (~{Math.round(musculKcalInfo.durationMin)} min)</span>
                  <span>~{Math.round(musculKcalInfo.kcal)} kcal</span>
                </div>
                {cardio.did === true && (
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Cardio ({cardio.type}, {cardio.minutes || 0} min)</span>
                    <span>~{Math.round(cardioKcal)} kcal</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-rose-400 font-semibold pt-1">
                  <span>Total estimado</span>
                  <span>~{Math.round(totalKcal)} kcal</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">Estimativa baseada no seu perfil e em valores médios de MET — o consumo real varia.</p>
            </div>
          )}

          <button onClick={save} disabled={saving} className="press w-full bg-rose-500 text-white font-semibold py-3.5 rounded-2xl mt-2">
            {saving ? "Salvando…" : "Salvar treino do dia"}
          </button>
          {msg === "copiado" && <p className="text-center text-sm text-teal-400 mt-2">Preenchido com o último treino — ajuste e salve.</p>}
          {msg === "erro" && <p className="text-center text-sm text-rose-400 mt-2">Não foi possível salvar. Seus dados continuam preenchidos — tente novamente.</p>}
        </div>
      )}

      <RestTimer
        secondsLeft={rest ? rest.secondsLeft : null}
        totalSeconds={rest ? rest.total : null}
        onSkip={() => setRest(null)}
        onAdjust={(d) => setRest((r) => r && { ...r, secondsLeft: Math.max(0, r.secondsLeft + d), total: Math.max(r.total, r.secondsLeft + d) })}
      />
    </div>
  );
}
