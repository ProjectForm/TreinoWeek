import { useState, useEffect, useMemo } from "react";
import { sList, sGet, sSet } from "./useStorage.js";
import { DEFAULT_BODY } from "../constants/config.js";
import { DEFAULT_MUSCLE_BREAKDOWN, MUSCLE_TO_GROUP } from "../constants/muscleBreakdown.js";
import { toISO, todayISO, weekdayFromISO, getWeekKey } from "../utils/dates.js";
import { DAYS } from "../constants/plan.js";
import {
  tonnageOf, statsOf, getBaseline, computeStatus, computeMeta,
  fallbackStatusAndMeta, sanitizeWeight, sanitizeReps,
  computeMusculKcal, computeCardioKcal,
} from "../utils/stats.js";
import { computeGroupVolumes } from "../utils/muscles.js";
import { computeWeekPayload, resolveStreak } from "../utils/week.js";
import { computePlayerStateEngine, multiplicadorStreak } from "../utils/xp.js";

// Hook central: dados de treino (dias, semanas, índices), migração de dados
// legados, formulário do dia atual, salvar/exportar/importar. Tudo que antes
// vivia dentro do componente App() de forma monolítica agora mora aqui.
export function useWorkoutData(plan, planReady) {
  const [date, setDate] = useState(todayISO());
  const [day, setDay] = useState(() => {
    const w = weekdayFromISO(todayISO());
    return DAYS.indexOf(w) >= 0 ? w : "seg";
  });

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
          try { loadedLogs[k.replace("day:", "")] = JSON.parse(raw); } catch (e) {}
        }
      }

      let loadedExHistory = {};
      const exHistRaw = await sGet("exerciseHistory");
      if (exHistRaw) {
        try { loadedExHistory = JSON.parse(exHistRaw); } catch (e) {}
      }
      let loadedLastWorkout = {};
      const lastWRaw = await sGet("lastWorkoutByExercise");
      if (lastWRaw) {
        try { loadedLastWorkout = JSON.parse(lastWRaw); } catch (e) {}
      }

      const weekKeys = await sList("week:");
      let loadedWeeks = {};
      for (const k of weekKeys) {
        const raw = await sGet(k);
        if (raw) {
          try { loadedWeeks[k.replace("week:", "")] = JSON.parse(raw); } catch (e) {}
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
        try { settings = { ...DEFAULT_BODY, ...JSON.parse(settingsRaw) }; } catch (e) {}
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
        next[item.id] = prev.sets.map((s) =>
          item.unilateral
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
    setCaffeine(saved && typeof saved.caffeine === "boolean" ? saved.caffeine : null);
    setCardio(saved && saved.cardio ? saved.cardio : { did: null, type: "caminhada", minutes: "", intensity: "moderada" });
  }, [day, date, ready, logs, plan]);

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
      const item = ((plan[day] && plan[day].items) || []).find((it) => it.id === exId);
      list.push(
        item && item.unilateral
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
  function repeatPrevious() {
    if (!previousSameDay) return;
    const src = logs[previousSameDay];
    const items = (plan[day] && plan[day].items) || [];
    const next = {};
    items.forEach((item) => {
      const prev = src.exercises && src.exercises[item.id];
      if (prev && prev.sets && prev.sets.length) {
        next[item.id] = prev.sets.map((s) =>
          item.unilateral
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
    setExportText(JSON.stringify(data));
  }

  async function doImport() {
    setImportMsg("");
    try {
      const imported = JSON.parse(importInput);
      for (const [key, rawValue] of Object.entries(imported)) {
        const value = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
        if (key.startsWith("day:")) {
          const existing = await sGet(key);
          if (existing) {
            const existingParsed = JSON.parse(existing);
            const importedParsed = JSON.parse(value);
            const existingDate = new Date(existingParsed.completedAt || "1970-01-01");
            const importedDate = new Date(importedParsed.completedAt || "1970-01-01");
            if (importedDate >= existingDate) await sSet(key, value);
          } else {
            await sSet(key, value);
          }
        } else {
          await sSet(key, value);
        }
      }
      setImportMsg("ok");
    } catch (e) {
      setImportMsg("erro");
    }
    setTimeout(() => setImportMsg(""), 4000);
  }

  return {
    date, setDate, day, setDay, shiftDate,
    logs, weeks, exerciseHistory, lastWorkoutByExercise, userCreatedAt,
    bodyStats, setBodyStats, saveProfile, profileMsg,
    entries, caffeine, setCaffeine, cardio, setCardio,
    updateSet, addSet, removeSet, repeatPrevious, previousSameDay, lastByExercise,
    groupVolumesLive, totalTonnage, musculKcalInfo, cardioKcal, totalKcal,
    ready, saving, msg, save,
    showSummary, setShowSummary, summaryData,
    allSessions,
    exportText, importInput, setImportInput, importMsg, doExport, doImport,
  };
}
