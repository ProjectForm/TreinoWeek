import { useState, useEffect, useMemo } from "react";
import { sList, sGet, sSet } from "./useStorage.js";
import { DEFAULT_BODY } from "../constants/config.js";
import { DEFAULT_MUSCLE_BREAKDOWN, MUSCLE_TO_GROUP } from "../constants/muscleBreakdown.js";
import { toISO, todayISO, weekdayFromISO, getWeekKey } from "../utils/dates.js";
import {
  statsOf, getBaseline, computeStatus, computeMeta,
  fallbackStatusAndMeta, sanitizeWeight, sanitizeReps,
  computeMusculKcal, computeCardioKcal,
} from "../utils/stats.js";
import { computeGroupVolumes } from "../utils/muscles.js";
import { computeWeekPayload, resolveStreak } from "../utils/week.js";
import { computePlayerStateEngine, multiplicadorStreak } from "../utils/xp.js";
import { buildExportPayload, parseBackupInput, isImportedDayNewer } from "../utils/backup.js";

// Hook central: dados de treino (dias, semanas, índices), migração de dados
// legados, formulário do dia atual, salvar/exportar/importar. Tudo que antes
// vivia dentro do componente App() de forma monolítica agora mora aqui.
export function useWorkoutData(plan, planReady) {
  const [date, setDate] = useState(todayISO());
  // Dia da semana é sempre derivado da data — nunca um estado separado que
  // possa dessincronizar (essa era a causa da inconsistência data/dia).
  const day = weekdayFromISO(date);

  const [logs, setLogs] = useState({});
  const [weeks, setWeeks] = useState({});
  const [exerciseHistory, setExerciseHistory] = useState({});
  const [lastWorkoutByExercise, setLastWorkoutByExercise] = useState({});
  const [userCreatedAt, setUserCreatedAt] = useState(null);
  const [bodyStats, setBodyStats] = useState(DEFAULT_BODY);

  const [entries, setEntries] = useState({});
  const [caffeine, setCaffeine] = useState(null);
  const [cardio, setCardio] = useState({ did: null, type: "caminhada", minutes: "", intensity: "moderada" });

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const [exportText, setExportText] = useState("");
  const [importInput, setImportInput] = useState("");
  const [importMsg, setImportMsg] = useState("");

  // ---- Carregamento inicial + migração de dados legados ----
  useEffect(() => {
    if (!planReady) return;
    let alive = true;
    (async () => {
      const dayKeys = await sList("day:");
      let loadedLogs = {};
      for (const k of dayKeys) {
        const raw = await sGet(k);
        if (raw) {
          try { loadedLogs[k.replace("day:", "")] = JSON.parse(raw); } catch (e) { /* registro de dia corrompido: ignora, resto do histórico carrega normalmente */ }
        }
      }

      let loadedExHistory = {};
      const exHistRaw = await sGet("exerciseHistory");
      if (exHistRaw) {
        try { loadedExHistory = JSON.parse(exHistRaw); } catch (e) { /* corrompido: segue com histórico vazio em vez de travar o app */ }
      }
      let loadedLastWorkout = {};
      const lastWRaw = await sGet("lastWorkoutByExercise");
      if (lastWRaw) {
        try { loadedLastWorkout = JSON.parse(lastWRaw); } catch (e) { /* corrompido: segue vazio em vez de travar o app */ }
      }

      const weekKeys = await sList("week:");
      let loadedWeeks = {};
      for (const k of weekKeys) {
        const raw = await sGet(k);
        if (raw) {
          try { loadedWeeks[k.replace("week:", "")] = JSON.parse(raw); } catch (e) { /* registro de semana corrompido: ignora, resto do histórico carrega normalmente */ }
        }
      }

      let loadedCreatedAt = await sGet("userCreatedAt");

      const needsMigration = Object.keys(loadedLogs).length > 0 &&
        Object.keys(loadedExHistory).length === 0 &&
        Object.keys(loadedWeeks).length === 0;

      if (needsMigration) {
        const sortedDates = Object.keys(loadedLogs).sort();
        const newExHistory = {};
        const newLastWorkout = {};

        for (const d of sortedDates) {
          const data = loadedLogs[d];
          if (!data.status || !data.meta) {
            const fb = fallbackStatusAndMeta(data, plan);
            data.status = fb.status;
            data.meta = { ...fb.meta, totalKcal: data.kcal || 0 };
          }
          if (!data.groupVolumes) {
            const entriesFlat = {};
            Object.keys(data.exercises || {}).forEach((id) => {
              entriesFlat[id] = (data.exercises[id] && data.exercises[id].sets) || [];
            });
            data.groupVolumes = computeGroupVolumes(entriesFlat, DEFAULT_MUSCLE_BREAKDOWN, MUSCLE_TO_GROUP);
          }
          if (!data.completedAt) data.completedAt = d + "T12:00:00.000Z";
          loadedLogs[d] = data;
          await sSet("day:" + d, JSON.stringify(data));

          Object.keys(data.exercises || {}).forEach((id) => {
            const st = statsOf(data.exercises[id].sets);
            if (st) {
              const arr = (newExHistory[id] || []).filter((e) => e.date !== d);
              arr.push({ date: d, max: st.max, volume: st.volume, sets: st.count });
              arr.sort((a, b) => a.date.localeCompare(b.date));
              newExHistory[id] = arr.length > 52 ? arr.slice(-52) : arr;
              newLastWorkout[id] = { date: d, max: st.max, volume: st.volume };
            }
          });
        }

        await sSet("exerciseHistory", JSON.stringify(newExHistory));
        await sSet("lastWorkoutByExercise", JSON.stringify(newLastWorkout));
        loadedExHistory = newExHistory;
        loadedLastWorkout = newLastWorkout;

        const distinctWeekKeys = [];
        sortedDates.forEach((d) => {
          const wk = getWeekKey(d);
          if (distinctWeekKeys.indexOf(wk) === -1) distinctWeekKeys.push(wk);
        });
        distinctWeekKeys.sort();
        const newWeeks = {};
        for (const wk of distinctWeekKeys) {
          const payload = computeWeekPayload(wk, plan, loadedLogs);
          payload.streakAtEnd = resolveStreak(wk, payload.perfectWeek, newWeeks);
          delete payload._pendingStreak;
          newWeeks[wk] = payload;
          await sSet("week:" + wk, JSON.stringify(payload));
        }
        loadedWeeks = newWeeks;

        if (!loadedCreatedAt) {
          loadedCreatedAt = sortedDates[0];
          await sSet("userCreatedAt", loadedCreatedAt);
        }
      }

      const settingsRaw = await sGet("settings");
      let settings = DEFAULT_BODY;
      if (settingsRaw) {
        try { settings = { ...DEFAULT_BODY, ...JSON.parse(settingsRaw) }; } catch (e) { /* corrompido: segue com os valores padrão */ }
      }

      if (alive) {
        setLogs(loadedLogs);
        setWeeks(loadedWeeks);
        setExerciseHistory(loadedExHistory);
        setLastWorkoutByExercise(loadedLastWorkout);
        setUserCreatedAt(loadedCreatedAt);
        setBodyStats(settings);
        setReady(true);
      }
    })();
    return () => { alive = false; };
  }, [planReady]);

  // ---- Último treino de cada exercício ----
  const lastByExercise = useMemo(() => {
    const out = {};
    Object.keys(exerciseHistory).forEach((id) => {
      const hist = (exerciseHistory[id] || []).filter((h) => h.date < date);
      if (hist.length) {
        const last = hist[hist.length - 1];
        const baseline = getBaseline(exerciseHistory, id, 8);
        const rawSets = logs[last.date] && logs[last.date].exercises && logs[last.date].exercises[id]
          ? logs[last.date].exercises[id].sets
          : [];
        out[id] = {
          date: last.date, max: last.max, volume: last.volume, sets: rawSets, baseline,
          caffeine: logs[last.date] ? logs[last.date].caffeine : null,
        };
      }
    });
    return out;
  }, [exerciseHistory, logs, date]);

  const previousSameDay = useMemo(() => {
    const dates = Object.keys(logs).filter((d) => d < date && logs[d] && logs[d].dayKey === day).sort();
    return dates.length ? dates[dates.length - 1] : null;
  }, [logs, date, day]);

  useEffect(() => {
    const items = (plan[day] && plan[day].items) || [];
    const saved = logs[date];
    const next = {};
    items.forEach((item) => {
      const prev = saved && saved.exercises && saved.exercises[item.id];
      if (prev && prev.sets && prev.sets.length) {
        // A forma salva (E/D ou peso único) manda — não o flag estático do
        // plano — porque o unilateral agora é uma escolha por sessão, não
        // uma configuração fixa do exercício.
        const wasUnilateral = prev.sets[0].weightD !== undefined;
        next[item.id] = prev.sets.map((s) =>
          wasUnilateral
            ? { weight: s.weight || "", weightD: s.weightD || "", reps: s.reps || "" }
            : { weight: s.weight || "", reps: s.reps || "" }
        );
      } else {
        // Dia novo, sem dado salvo: começa sempre no modo padrão (peso
        // único), a menos que o plano já configure o exercício como
        // unilateral por padrão (ex.: rosca concentrada).
        next[item.id] = [];
        for (let i = 0; i < item.sets; i++) {
          next[item.id].push(item.unilateral ? { weight: "", weightD: "", reps: item.reps } : { weight: "", reps: item.reps });
        }
      }
    });
    setEntries(next);
    setCaffeine(saved && typeof saved.caffeine === "boolean" ? saved.caffeine : null);
    setCardio(saved && saved.cardio ? saved.cardio : { did: null, type: "caminhada", minutes: "", intensity: "moderada" });
  }, [date, ready, logs, plan]);

  function updateSet(exId, idx, field, value) {
    const clean = field === "reps" ? sanitizeReps(value) : sanitizeWeight(value);
    setEntries((prev) => ({
      ...prev,
      [exId]: (prev[exId] || []).map((s, i) => (i === idx ? { ...s, [field]: clean } : s)),
    }));
  }
  function addSet(exId) {
    setEntries((prev) => {
      const list = prev[exId] ? prev[exId].slice() : [];
      const last = list[list.length - 1];
      const isUnilateral = last
        ? last.weightD !== undefined
        : !!((plan[day] && plan[day].items) || []).find((it) => it.id === exId)?.unilateral;
      list.push(
        isUnilateral
          ? { weight: "", weightD: "", reps: last ? last.reps : "" }
          : { weight: "", reps: last ? last.reps : "" }
      );
      return { ...prev, [exId]: list };
    });
  }
  function removeSet(exId, idx) {
    setEntries((prev) => {
      const list = prev[exId] ? prev[exId].slice() : [];
      if (list.length <= 1) return prev;
      list.splice(idx, 1);
      return { ...prev, [exId]: list };
    });
  }
  // Alterna o modo unilateral do exercício NESTA sessão — puramente estado
  // local em memória (entries), nunca persistido como preferência. Reshapea
  // as séries já preenchidas preservando o que der pra preservar.
  function setExerciseUnilateral(exId, unilateral) {
    setEntries((prev) => {
      const list = prev[exId] || [];
      const next = list.map((s) =>
        unilateral
          ? { weight: s.weight || "", weightD: s.weightD || "", reps: s.reps || "" }
          : { weight: s.weight || "", reps: s.reps || "" }
      );
      return { ...prev, [exId]: next };
    });
  }
  // Repete só um exercício, usando a última vez que ele foi feito (qualquer
  // dia, via lastByExercise) — diferente de repeatPrevious, que repete o
  // treino inteiro do mesmo dia da semana. Adota a forma (E/D ou única) de
  // como foi salvo da última vez.
  function repeatExercise(exId) {
    const hist = lastByExercise[exId];
    if (!hist || !hist.sets || !hist.sets.length) return false;
    const wasUnilateral = hist.sets[0].weightD !== undefined;
    setEntries((prev) => ({
      ...prev,
      [exId]: hist.sets.map((s) =>
        wasUnilateral
          ? { weight: s.weight || "", weightD: s.weightD || "", reps: s.reps || "" }
          : { weight: s.weight || "", reps: s.reps || "" }
      ),
    }));
    return true;
  }

  function repeatPrevious() {
    if (!previousSameDay) return;
    const src = logs[previousSameDay];
    const items = (plan[day] && plan[day].items) || [];
    const next = {};
    items.forEach((item) => {
      const prev = src.exercises && src.exercises[item.id];
      if (prev && prev.sets && prev.sets.length) {
        const wasUnilateral = prev.sets[0].weightD !== undefined;
        next[item.id] = prev.sets.map((s) =>
          wasUnilateral
            ? { weight: s.weight || "", weightD: s.weightD || "", reps: s.reps || "" }
            : { weight: s.weight || "", reps: s.reps || "" }
        );
      } else {
        next[item.id] = [];
        for (let i = 0; i < item.sets; i++) {
          next[item.id].push(item.unilateral ? { weight: "", weightD: "", reps: item.reps } : { weight: "", reps: item.reps });
        }
      }
    });
    setEntries(next);
    setMsg("copiado");
    setTimeout(() => setMsg(""), 2500);
  }

  const groupVolumesLive = useMemo(() => computeGroupVolumes(entries, DEFAULT_MUSCLE_BREAKDOWN, MUSCLE_TO_GROUP), [entries]);
  const totalTonnage = useMemo(() => Object.values(groupVolumesLive).reduce((a, b) => a + b, 0), [groupVolumesLive]);
  const musculKcalInfo = useMemo(() => computeMusculKcal(entries, bodyStats), [entries, bodyStats]);
  const cardioKcal = useMemo(() => computeCardioKcal(cardio, bodyStats), [cardio, bodyStats]);
  const totalKcal = musculKcalInfo.kcal + cardioKcal;

  async function save() {
    setSaving(true);
    setMsg("");
    const planItems = (plan[day] && plan[day].items) || [];
    const exercisesPayload = {};
    Object.keys(entries).forEach((id) => {
      exercisesPayload[id] = { sets: entries[id] };
    });

    const meta = computeMeta(entries, planItems);
    const status = computeStatus(meta.totalExercisesPlanned, meta.totalExercisesCompleted);
    const groupVolumes = computeGroupVolumes(entries, DEFAULT_MUSCLE_BREAKDOWN, MUSCLE_TO_GROUP);

    const payload = {
      dayKey: day,
      exercises: exercisesPayload,
      cardio,
      caffeine,
      status,
      completedAt: new Date().toISOString(),
      meta: { ...meta, totalKcal: totalKcal },
      groupVolumes,
      bodyStats,
      kcal: totalKcal,
      kcalMusculacao: musculKcalInfo.kcal,
      kcalCardio: cardioKcal,
    };

    try {
      await sSet("day:" + date, JSON.stringify(payload));

      const newExHistory = { ...exerciseHistory };
      const newLastWorkout = { ...lastWorkoutByExercise };
      Object.keys(exercisesPayload).forEach((id) => {
        const st = statsOf(exercisesPayload[id].sets);
        if (st) {
          const arr = (newExHistory[id] || []).filter((e) => e.date !== date);
          arr.push({ date, max: st.max, volume: st.volume, sets: st.count });
          arr.sort((a, b) => a.date.localeCompare(b.date));
          newExHistory[id] = arr.length > 52 ? arr.slice(-52) : arr;
          newLastWorkout[id] = { date, max: st.max, volume: st.volume };
        }
      });
      await sSet("exerciseHistory", JSON.stringify(newExHistory));
      await sSet("lastWorkoutByExercise", JSON.stringify(newLastWorkout));

      const newLogs = { ...logs, [date]: payload };
      const weekKey = getWeekKey(date);
      const weeksWithoutThis = { ...weeks };
      delete weeksWithoutThis[weekKey];
      const weekPayload = computeWeekPayload(weekKey, plan, newLogs);
      weekPayload.streakAtEnd = resolveStreak(weekKey, weekPayload.perfectWeek, weeksWithoutThis);
      delete weekPayload._pendingStreak;
      await sSet("week:" + weekKey, JSON.stringify(weekPayload));
      const newWeeks = { ...weeks, [weekKey]: weekPayload };

      if (!userCreatedAt) {
        await sSet("userCreatedAt", date);
        setUserCreatedAt(date);
      }

      const priorDates = Object.keys(newLogs).filter((d) => d < date && newLogs[d].dayKey === day && newLogs[d].meta).sort();
      const prevSameDayData = priorDates.length
        ? { date: priorDates[priorDates.length - 1], meta: newLogs[priorDates[priorDates.length - 1]].meta }
        : null;

      const freshEngine = computePlayerStateEngine(newLogs, newWeeks);
      const rpgSummary = {
        narratives: freshEngine.narrativesByDate[date] || [],
        flags: freshEngine.flagsByDate[date] || [],
        streakAtual: freshEngine.streakAtual,
        multiplicador: multiplicadorStreak(freshEngine.streakAtual),
        weekBreakdown: freshEngine.lastWeekXPBreakdown && freshEngine.lastWeekXPBreakdown.weekKey === weekKey ? freshEngine.lastWeekXPBreakdown : null,
        escudos: freshEngine.escudos,
        primeiroTreino: freshEngine.totalTreinosCompletos === 1,
      };

      setLogs(newLogs);
      setExerciseHistory(newExHistory);
      setLastWorkoutByExercise(newLastWorkout);
      setWeeks(newWeeks);
      setSummaryData({ dayData: payload, previousSameDay: prevSameDayData, rpg: rpgSummary });
      setShowSummary(true);
      setMsg("ok");
    } catch (e) {
      setMsg("erro");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function saveProfile() {
    try {
      await sSet("settings", JSON.stringify(bodyStats));
      setProfileMsg("ok");
    } catch (e) {
      setProfileMsg("erro");
    }
    setTimeout(() => setProfileMsg(""), 2500);
  }

  function shiftDate(delta) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setDate(toISO(d));
  }

  const allSessions = useMemo(() => {
    return Object.keys(logs).sort().reverse().map((d) => {
      const data = logs[d];
      const meta = data.meta || fallbackStatusAndMeta(data, plan).meta;
      const status = data.status || fallbackStatusAndMeta(data, plan).status;
      return {
        date: d, dayKey: data.dayKey, caffeine: data.caffeine, cardio: data.cardio,
        kcal: data.kcal || 0, volume: meta.totalVolume || 0, exercisesCompleted: meta.totalExercisesCompleted || 0, status,
      };
    }).filter((r) => r.status !== "skipped");
  }, [logs, plan]);

  async function doExport() {
    const data = {};
    const dayKeys = await sList("day:");
    for (const k of dayKeys) { const v = await sGet(k); if (v) data[k] = v; }
    const weekKeys = await sList("week:");
    for (const k of weekKeys) { const v = await sGet(k); if (v) data[k] = v; }
    const singles = ["settings", "exerciseHistory", "lastWorkoutByExercise", "userCreatedAt", "plan", "tituloAtivo", "lastSeenAscensao"];
    for (const k of singles) { const v = await sGet(k); if (v) data[k] = v; }
    setExportText(JSON.stringify(buildExportPayload(data)));
  }

  async function doImport() {
    setImportMsg("");
    const parsed = parseBackupInput(importInput);
    if (!parsed) {
      setImportMsg("erro");
      setTimeout(() => setImportMsg(""), 4000);
      return;
    }
    // Cada chave é importada de forma independente: uma entrada corrompida
    // ou com formato inesperado é pulada, sem abortar (nem corromper) o
    // restante do backup já processado.
    let importedCount = 0;
    for (const [key, rawValue] of Object.entries(parsed.data)) {
      try {
        const value = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
        if (key.startsWith("day:")) {
          const existing = await sGet(key);
          if (!existing || isImportedDayNewer(existing, value)) {
            await sSet(key, value);
            importedCount++;
          }
        } else {
          await sSet(key, value);
          importedCount++;
        }
      } catch (e) {
        // entrada individual ilegível: preserva o que já estava salvo e segue pro próximo item
      }
    }
    setImportMsg(importedCount > 0 ? "ok" : "erro");
    setTimeout(() => setImportMsg(""), 4000);
  }

  return {
    date, setDate, day, shiftDate,
    logs, weeks, exerciseHistory, lastWorkoutByExercise, userCreatedAt,
    bodyStats, setBodyStats, saveProfile, profileMsg,
    entries, caffeine, setCaffeine, cardio, setCardio,
    updateSet, addSet, removeSet, setExerciseUnilateral, repeatPrevious, repeatExercise, previousSameDay, lastByExercise,
    groupVolumesLive, totalTonnage, musculKcalInfo, cardioKcal, totalKcal,
    ready, saving, msg, save,
    showSummary, setShowSummary, summaryData,
    allSessions,
    exportText, importInput, setImportInput, importMsg, doExport, doImport,
  };
}
