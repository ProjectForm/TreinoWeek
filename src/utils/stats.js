import { CARDIO_MET, MET_MUSCULACAO, DEFAULT_BODY } from "../constants/config.js";

// ---- Definições centrais de "série" usadas em todo o app ----
//
// effectiveWeight: peso "de volume" de uma série. Para exercícios normais é
// só o peso; para unilaterais (que guardam weight=E e weightD=D) é a soma
// dos dois lados, que é a base de volume = (peso_E + peso_D) * reps. Como
// weightD é undefined em séries não-unilaterais, isso equivale exatamente ao
// comportamento antigo (parseFloat(s.weight) || 0) pro resto do app.
//
// maxSideWeight: peso "de carga" de uma série — a maior carga MOVIDA DE UM
// LADO, não a soma dos dois. Uma série de 10kg na esquerda + 10kg na direita
// representa uma carga de 10kg por braço, não um PR de 20kg — 20kg é volume,
// não carga máxima. Para séries não-unilaterais equivale a effectiveWeight
// (não há dois lados pra distinguir).
//
// isSetPerformed: define o que conta como "série realizada" pro resto do
// app (duração/calorias, contagem de séries completas, etc.) — uma série só
// é considerada realizada se tiver algum peso real registrado (weight e/ou
// weightD > 0). Uma linha de série vazia adicionada ao formulário mas nunca
// preenchida NÃO conta.
export function effectiveWeight(s) {
  const w = parseFloat(s.weight) || 0;
  const wd = parseFloat(s.weightD) || 0;
  return w + wd;
}

export function maxSideWeight(s) {
  const w = parseFloat(s.weight) || 0;
  if (s.weightD === undefined) return w;
  const wd = parseFloat(s.weightD) || 0;
  return Math.max(w, wd);
}

export function isSetPerformed(s) {
  return effectiveWeight(s) > 0;
}

export function tonnageOf(sets) {
  return (sets || []).reduce((acc, s) => {
    const w = effectiveWeight(s);
    const r = parseFloat(s.reps) || 0;
    return w > 0 ? acc + w * r : acc;
  }, 0);
}

export function statsOf(sets) {
  const valid = (sets || []).filter(isSetPerformed);
  if (!valid.length) return null;
  const maxes = valid.map(maxSideWeight);
  const volume = valid.reduce((acc, s) => acc + effectiveWeight(s) * (parseFloat(s.reps) || 0), 0);
  return { max: Math.max.apply(null, maxes), count: valid.length, volume: volume, sets: valid };
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
    totalSets += sets.filter(isSetPerformed).length;
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

// BUG CORRIGIDO: antes contava (entries[id] || []).length — ou seja, toda
// LINHA de série existente no formulário, incluindo séries vazias (nunca
// preenchidas) ou adicionadas via "+ adicionar série" e não usadas. Isso
// inflava a duração/calorias estimadas de treinos parciais (contava a sessão
// inteira planejada, não o que foi de fato feito). Agora conta só séries
// realizadas (isSetPerformed — mesma definição usada em tonnageOf/statsOf/
// computeMeta, só que antes não era usada aqui).
export function computeMusculKcal(entries, bodyStats) {
  let totalSets = 0;
  Object.keys(entries).forEach((id) => {
    totalSets += (entries[id] || []).filter(isSetPerformed).length;
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
