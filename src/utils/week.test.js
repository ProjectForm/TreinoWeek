import { describe, it, expect } from "vitest";
import { computeWeekPayload, resolveStreak } from "./week.js";

const plan = {
  seg: { items: [{ id: "supino" }] },
  qua: { items: [{ id: "agachamento" }] },
  sex: { items: [{ id: "remada" }] },
};

const WEEK_KEY = "2026-W33"; // seg 2026-08-10 .. dom 2026-08-16

function completedLog() {
  return { status: "completed" };
}
function partialLog() {
  return { status: "partial" };
}

describe("computeWeekPayload", () => {
  it("semana perfeita: todos os dias planejados completos", () => {
    const logs = {
      "2026-08-10": completedLog(),
      "2026-08-12": completedLog(),
      "2026-08-14": completedLog(),
    };
    const r = computeWeekPayload(WEEK_KEY, plan, logs);
    expect(r.perfectWeek).toBe(true);
    expect(r.completedDays).toEqual(["seg", "qua", "sex"]);
    expect(r.skippedDays).toEqual([]);
  });

  it("semana incompleta: um dia planejado sem log vira 'skipped'", () => {
    const logs = {
      "2026-08-10": completedLog(),
      "2026-08-12": completedLog(),
      // sex sem log
    };
    const r = computeWeekPayload(WEEK_KEY, plan, logs);
    expect(r.perfectWeek).toBe(false);
    expect(r.completedDays).toEqual(["seg", "qua"]);
    expect(r.skippedDays).toEqual(["sex"]);
  });

  it("dia com treino parcial não conta como completo nem some da semana", () => {
    const logs = {
      "2026-08-10": completedLog(),
      "2026-08-12": partialLog(),
      "2026-08-14": completedLog(),
    };
    const r = computeWeekPayload(WEEK_KEY, plan, logs);
    expect(r.perfectWeek).toBe(false);
    expect(r.partialDays).toEqual(["qua"]);
  });

  it("semana sem nenhum dia planejado não é considerada perfeita", () => {
    const r = computeWeekPayload(WEEK_KEY, {}, {});
    expect(r.perfectWeek).toBe(false);
    expect(r.plannedDays).toEqual([]);
  });

  it("log de um treino repetido no mesmo dia usa o status persistido mais recente (fonte é logs[isoDate])", () => {
    const logs = { "2026-08-10": completedLog() };
    const planOnlyMonday = { seg: { items: [{ id: "supino" }] } };
    const r = computeWeekPayload(WEEK_KEY, planOnlyMonday, logs);
    expect(r.completedDays).toEqual(["seg"]);
  });
});

describe("resolveStreak", () => {
  it("primeira semana perfeita: streak = 1", () => {
    expect(resolveStreak("2026-W33", true, {})).toBe(1);
  });

  it("semana não perfeita: streak = 0", () => {
    expect(resolveStreak("2026-W33", false, {})).toBe(0);
  });

  it("sequência de semanas perfeitas consecutivas incrementa o streak", () => {
    const weeksMap = {
      "2026-W31": { perfectWeek: true },
      "2026-W32": { perfectWeek: true },
    };
    expect(resolveStreak("2026-W33", true, weeksMap)).toBe(3);
  });

  it("quebra de streak: uma semana não perfeita no meio do histórico interrompe a contagem", () => {
    const weeksMap = {
      "2026-W30": { perfectWeek: true },
      "2026-W31": { perfectWeek: false },
      "2026-W32": { perfectWeek: true },
    };
    expect(resolveStreak("2026-W33", true, weeksMap)).toBe(2);
  });

  it("recuperação após quebra: reconta a partir da semana atual, ignorando o histórico anterior à quebra", () => {
    const weeksMap = {
      "2026-W29": { perfectWeek: true },
      "2026-W30": { perfectWeek: false },
      "2026-W31": { perfectWeek: true },
      "2026-W32": { perfectWeek: true },
    };
    expect(resolveStreak("2026-W33", true, weeksMap)).toBe(3);
  });

  it("virada de ano: streak continua contando corretamente entre 2025-W52 e 2026-W01", () => {
    const weeksMap = { "2025-W52": { perfectWeek: true } };
    expect(resolveStreak("2026-W01", true, weeksMap)).toBe(2);
  });
});
