import { CARDIO_MET, MET_MUSCULACAO, DEFAULT_BODY } from "../constants/config.js";

// Peso "efetivo" de uma série: para exercícios normais é só o peso; para
// unilaterais (que guardam weight=E e weightD=D) é a soma dos dois lados,
// que é a base de volume = (peso_E + peso_D) * reps. Como weightD é
// undefined em séries não-unilaterais, isso equivale exatamente ao
// comportamento antigo (parseFloat(s.weight) || 0) para todo o resto do app.
export function effectiveWeight(s) {
  const w = parseFloat(s.weight) || 0;
  const wd = parseFloat(s.weightD) || 0;
  return w + wd;
}

export function tonnageOf(sets) {
  return (sets || []).reduce((acc, s) => {
    const w = effectiveWeight(s);
    const r = parseFloat(s.reps) || 0;
    return w > 0 ? acc + w * r : acc;
  }, 0);
}

export function statsOf(sets) {
  const valid = (sets || []).filter((s) => effectiveWeight(s) > 0);
  if (!valid.length) return null;
  const weights = valid.map((s) => effectiveWeight(s));
  const volume = valid.reduce((acc, s) => acc + effectiveWeight(s) * (parseFloat(s.reps) || 0), 0);
  return { max: Math.max.apply(null, weights), count: valid.length, volume: volume, sets: valid };
}

export function getBaseline(exerciseHistory, exerciseId, weeks) {
  const n = weeks || 8;
  const entries = (exerciseHistory && exerciseHistory[exerciseId]) || [];
  if (entries.length < 2) return null;
  const recent = entries.slice(-n);
  const avgMax = recent.reduce((a, e) => a + e.max, 0) / recent.length;
  const avgVolume = recent.reduce((a, e) => a + e.volume, 0) / recent.length;
  return { avgMax, avgVolume, count: recent.length };
}

export function computeStatus(totalPlanned, totalCompleted) {
  if (totalCompleted === 0) return "skipped";
  if (totalPlanned < 3) return totalCompleted === totalPlanned ? "completed" : "partial";
  return totalCompleted >= 3 ? "completed" : "partial";
}

export function computeMeta(entries, planItems) {
  const totalExercisesPlanned = planItems.length;
  let totalExercisesCompleted = 0, totalSets = 0, totalVolume = 0;
  planItems.forEach((item) => {
    const sets = entries[item.id] || [];
    const t = tonnageOf(sets);
    if (t > 0) totalExercisesCompleted++;
    totalSets += sets.filter((s) => effectiveWeight(s) > 0).length;
    totalVolume += t;
  });
  return { totalExercisesPlanned, totalExercisesCompleted, totalSets, totalVolume };
}

export function fallbackStatusAndMeta(dayLog, plan) {
  const planItems = (plan[dayLog.dayKey] && plan[dayLog.dayKey].items) || [];
  const entries = {};
  Object.keys(dayLog.exercises || {}).forEach((id) => {
    entries[id] = (dayLog.exercises[id] && dayLog.exercises[id].sets) || [];
  });
  const meta = computeMeta(entries, planItems);
  const status = computeStatus(meta.totalExercisesPlanned, meta.totalExercisesCompleted);
  return { status, meta };
}

export function sanitizeWeight(value) {
  if (value === "") return "";
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return "";
  if (num > 500) return 500;
  return Math.round(num * 2) / 2;
}

export function sanitizeReps(value) {
  if (value === "") return "";
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) return "";
  if (num > 100) return 100;
  return num;
}

export function sanitizeMinutes(value) {
  if (value === "") return "";
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) return "";
  if (num > 300) return 300;
  return num;
}

export function computeMusculKcal(entries, bodyStats) {
  let totalSets = 0;
  Object.keys(entries).forEach((id) => {
    totalSets += (entries[id] || []).length;
  });
  const secPerSet = bodyStats.secPerSet || DEFAULT_BODY.secPerSet;
  const durationMin = (totalSets * secPerSet) / 60;
  const kcal = MET_MUSCULACAO * (bodyStats.weight || DEFAULT_BODY.weight) * (durationMin / 60);
  return { kcal, durationMin, totalSets };
}

export function computeCardioKcal(cardio, bodyStats) {
  if (!cardio || !cardio.did) return 0;
  const table = CARDIO_MET[cardio.type] || {};
  const met = table[cardio.intensity];
  if (!met) return 0;
  const minutes = parseFloat(cardio.minutes) || 0;
  return met * (bodyStats.weight || DEFAULT_BODY.weight) * (minutes / 60);
}
