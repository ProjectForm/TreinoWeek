import { getWeekDatesFromWeekKey, weekdayFromISO } from "./dates.js";
import { fallbackStatusAndMeta } from "./stats.js";

export function computeWeekPayload(weekKey, plan, logs) {
  const dates = getWeekDatesFromWeekKey(weekKey);
  const plannedDays = Object.keys(plan).filter((k) => (plan[k].items || []).length > 0);
  const completedDays = [], partialDays = [], skippedDays = [];
  plannedDays.forEach((dayKey) => {
    const isoDate = dates.find((d) => weekdayFromISO(d) === dayKey);
    const dayData = isoDate ? logs[isoDate] : null;
    if (!dayData) {
      skippedDays.push(dayKey);
      return;
    }
    const status = dayData.status || fallbackStatusAndMeta(dayData, plan).status;
    if (status === "completed") completedDays.push(dayKey);
    else if (status === "partial") partialDays.push(dayKey);
    else skippedDays.push(dayKey);
  });
  const isPerfect = completedDays.length === plannedDays.length && plannedDays.length > 0;
  return { weekKey, plannedDays, completedDays, partialDays, skippedDays, perfectWeek: isPerfect, _pendingStreak: isPerfect };
}

export function resolveStreak(weekKey, isPerfect, weeksMap) {
  let streak = isPerfect ? 1 : 0;
  if (isPerfect) {
    const priorWeeks = Object.keys(weeksMap).filter((k) => k < weekKey).sort().reverse();
    for (const wk of priorWeeks) {
      const pw = weeksMap[wk];
      if (pw && pw.perfectWeek) streak++;
      else break;
    }
  }
  return streak;
}
