import { describe, it, expect } from "vitest";
import {
  toISO,
  weekdayFromISO,
  getWeekKey,
  getWeekDates,
  mondayFromWeekKey,
  getWeekDatesFromWeekKey,
  daysBetween,
} from "./dates.js";

describe("weekdayFromISO", () => {
  it("identifica corretamente o dia da semana (regressão do bug relatado: 11/08/2026 é terça)", () => {
    expect(weekdayFromISO("2026-08-11")).toBe("ter");
  });
  it("segunda-feira", () => {
    expect(weekdayFromISO("2026-08-10")).toBe("seg");
  });
  it("domingo", () => {
    expect(weekdayFromISO("2026-08-16")).toBe("dom");
  });
});

describe("toISO (não deve depender do timezone local para o resultado esperado)", () => {
  it("um Date criado à meia-noite local produz a data ISO correspondente, sem deslocar um dia", () => {
    const d = new Date(2026, 7, 11); // 11/ago/2026 local, mês 0-indexado
    expect(toISO(d)).toBe("2026-08-11");
  });
  it("funciona em virada de mês", () => {
    expect(toISO(new Date(2026, 7, 31))).toBe("2026-08-31");
    expect(toISO(new Date(2026, 8, 1))).toBe("2026-09-01");
  });
  it("funciona em virada de ano", () => {
    expect(toISO(new Date(2025, 11, 31))).toBe("2025-12-31");
    expect(toISO(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("getWeekKey (ISO-8601, semana ancorada na quinta-feira)", () => {
  it("segunda-feira pertence à mesma semana ISO que a quinta seguinte", () => {
    expect(getWeekKey("2026-08-10")).toBe(getWeekKey("2026-08-13"));
  });
  it("domingo pertence à semana ISO que termina nele (não à semana seguinte)", () => {
    expect(getWeekKey("2026-08-16")).toBe(getWeekKey("2026-08-10"));
  });
  it("virada de semana: domingo e a segunda seguinte são semanas ISO diferentes", () => {
    expect(getWeekKey("2026-08-16")).not.toBe(getWeekKey("2026-08-17"));
  });
  it("virada de mês não quebra o cálculo de semana", () => {
    const wkEndOfMonth = getWeekKey("2026-08-31");
    const wkStartOfMonth = getWeekKey("2026-09-01");
    expect(typeof wkEndOfMonth).toBe("string");
    expect(typeof wkStartOfMonth).toBe("string");
  });
  it("virada de ano: 31/dez/2025 e 01/jan/2026 caem na mesma semana ISO (2026-W01, pois a quinta dessa semana é 1/jan)", () => {
    expect(getWeekKey("2025-12-31")).toBe("2026-W01");
    expect(getWeekKey("2026-01-01")).toBe("2026-W01");
  });
  it("28/dez/2025 (domingo) ainda pertence à última semana de 2025", () => {
    expect(getWeekKey("2025-12-28")).toBe("2025-W52");
  });
  it("ano com 53 semanas ISO (2020): 31/dez/2020 pertence à semana 53 de 2020, não à semana 1 de 2021", () => {
    expect(getWeekKey("2020-12-31")).toBe("2020-W53");
    expect(getWeekKey("2021-01-01")).toBe("2020-W53");
    expect(getWeekKey("2021-01-04")).toBe("2021-W01");
  });
  it("datas consecutivas dentro da mesma semana retornam a mesma chave", () => {
    const keys = ["2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16"].map(
      getWeekKey
    );
    expect(new Set(keys).size).toBe(1);
  });
});

describe("mondayFromWeekKey / getWeekDatesFromWeekKey (round-trip com getWeekKey)", () => {
  it("a segunda-feira resultante, quando convertida de volta, gera a mesma weekKey", () => {
    const wk = "2026-W33";
    const monday = mondayFromWeekKey(wk);
    expect(getWeekKey(monday)).toBe(wk);
  });
  it("getWeekDatesFromWeekKey retorna 7 dias, de segunda a domingo", () => {
    const dates = getWeekDatesFromWeekKey("2026-W33");
    expect(dates).toHaveLength(7);
    expect(weekdayFromISO(dates[0])).toBe("seg");
    expect(weekdayFromISO(dates[6])).toBe("dom");
  });
  it("funciona corretamente na virada de ano (semana 2026-W01 começa em 2025-12-29)", () => {
    expect(mondayFromWeekKey("2026-W01")).toBe("2025-12-29");
  });
});

describe("getWeekDates", () => {
  it("qualquer dia da semana informado retorna a mesma semana (segunda a domingo)", () => {
    const fromMonday = getWeekDates("2026-08-10");
    const fromSunday = getWeekDates("2026-08-16");
    expect(fromMonday).toEqual(fromSunday);
  });
});

describe("daysBetween", () => {
  it("datas fora de ordem retornam diferença negativa (não lança erro)", () => {
    expect(daysBetween("2026-08-15", "2026-08-10")).toBe(-5);
  });
  it("datas em ordem crescente retornam diferença positiva", () => {
    expect(daysBetween("2026-08-10", "2026-08-15")).toBe(5);
  });
  it("mesma data retorna 0", () => {
    expect(daysBetween("2026-08-10", "2026-08-10")).toBe(0);
  });
  it("atravessa virada de ano corretamente", () => {
    expect(daysBetween("2025-12-30", "2026-01-02")).toBe(3);
  });
});
