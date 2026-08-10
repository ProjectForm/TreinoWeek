import { WEEKDAY_KEYS } from "../constants/plan.js";

export function toISO(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function todayISO() {
  return toISO(new Date());
}

export function weekdayFromISO(iso) {
  return WEEKDAY_KEYS[new Date(iso + "T00:00:00").getDay()];
}

export function getWeekKey(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getFullYear() + "-W" + String(weekNo).padStart(2, "0");
}

export function getWeekDates(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const curr = new Date(monday);
    curr.setDate(monday.getDate() + i);
    dates.push(toISO(curr));
  }
  return dates;
}

export function mondayFromWeekKey(weekKey) {
  const [yearStr, wStr] = weekKey.split("-W");
  const year = parseInt(yearStr, 10), week = parseInt(wStr, 10);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - (jan4Day - 1));
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  return toISO(monday);
}

export function getWeekDatesFromWeekKey(weekKey) {
  return getWeekDates(mondayFromWeekKey(weekKey));
}

export function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}
