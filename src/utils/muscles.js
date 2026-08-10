import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { tonnageOf } from "./stats.js";

export function computeGroupVolumes(entries, muscleBreakdown, muscleToGroup) {
  const groupVolumes = {};
  GROUP_ORDER.forEach((g) => (groupVolumes[g] = 0));
  Object.keys(entries).forEach((exId) => {
    const sets = entries[exId] || [];
    const exerciseVolume = tonnageOf(sets);
    if (exerciseVolume <= 0) return;
    const breakdown = muscleBreakdown[exId] || [];
    breakdown.forEach(({ m, p }) => {
      const group = muscleToGroup[m];
      if (group) groupVolumes[group] = (groupVolumes[group] || 0) + (exerciseVolume * p) / 100;
    });
  });
  return groupVolumes;
}
