import { daysBetween } from "./dates.js";

export function formatBR(iso) {
  const p = iso.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

export function formatShort(iso) {
  const p = iso.split("-");
  return p[2] + "/" + p[1];
}

export function agoLabel(iso, ref) {
  const n = daysBetween(iso, ref);
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  if (n < 7) return "há " + n + " dias";
  if (n < 14) return "há 1 semana";
  return "há " + Math.floor(n / 7) + " semanas";
}

export function formatWeight(kg) {
  if (!kg) return "0 kg";
  if (kg >= 1000) return (kg / 1000).toFixed(1).replace(".", ",") + " toneladas";
  return Math.round(kg) + " kg";
}
