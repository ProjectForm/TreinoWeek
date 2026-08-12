import { describe, it, expect } from "vitest";
import {
  effectiveWeight,
  maxSideWeight,
  isSetPerformed,
  statsOf,
  computeMeta,
  computeMusculKcal,
  computeCardioKcal,
  sanitizeWeight,
  sanitizeReps,
} from "./stats.js";
import { DEFAULT_BODY } from "../constants/config.js";

describe("effectiveWeight (unidade de VOLUME)", () => {
  it("série bilateral: retorna o próprio peso", () => {
    expect(effectiveWeight({ weight: 20, reps: 10 })).toBe(20);
  });
  it("série unilateral: soma E+D", () => {
    expect(effectiveWeight({ weight: 10, weightD: 10, reps: 10 })).toBe(20);
  });
  it("série unilateral com lados diferentes: soma os dois lados", () => {
    expect(effectiveWeight({ weight: 12, weightD: 8, reps: 10 })).toBe(20);
  });
  it("peso vazio/inválido conta como 0", () => {
    expect(effectiveWeight({ weight: "", reps: 10 })).toBe(0);
    expect(effectiveWeight({ weight: "abc", reps: 10 })).toBe(0);
  });
});

describe("maxSideWeight (unidade de CARGA/PR)", () => {
  it("série bilateral: retorna o próprio peso", () => {
    expect(maxSideWeight({ weight: 20 })).toBe(20);
  });
  it("série unilateral com lados iguais: NÃO soma, retorna só um lado", () => {
    // Este é o bug corrigido: 10kg E + 10kg D é carga de 10kg por lado, não 20kg.
    expect(maxSideWeight({ weight: 10, weightD: 10 })).toBe(10);
  });
  it("série unilateral com lados diferentes: retorna o maior lado", () => {
    expect(maxSideWeight({ weight: 12, weightD: 18 })).toBe(18);
    expect(maxSideWeight({ weight: 18, weightD: 12 })).toBe(18);
  });
  it("unilateral só de um lado (outro em 0): retorna o lado preenchido", () => {
    expect(maxSideWeight({ weight: 15, weightD: 0 })).toBe(15);
    expect(maxSideWeight({ weight: 0, weightD: 15 })).toBe(15);
  });
});

describe("isSetPerformed (predicado de série realizada)", () => {
  it("série com peso > 0: realizada", () => {
    expect(isSetPerformed({ weight: 5, reps: 10 })).toBe(true);
  });
  it("série vazia (nunca preenchida): não realizada", () => {
    expect(isSetPerformed({ weight: "", reps: "" })).toBe(false);
  });
  it("série com peso 0 explícito: não realizada", () => {
    expect(isSetPerformed({ weight: 0, reps: 10 })).toBe(false);
  });
  it("unilateral com só um lado preenchido: realizada", () => {
    expect(isSetPerformed({ weight: 0, weightD: 10, reps: 10 })).toBe(true);
  });
});

describe("statsOf", () => {
  it("retorna null quando não há séries realizadas", () => {
    expect(statsOf([{ weight: "", reps: "" }])).toBeNull();
    expect(statsOf([])).toBeNull();
    expect(statsOf(undefined)).toBeNull();
  });
  it("max usa maxSideWeight (carga), volume usa effectiveWeight (E+D)", () => {
    const r = statsOf([{ weight: 10, weightD: 10, reps: 10 }]);
    expect(r.max).toBe(10);
    expect(r.volume).toBe(200); // (10+10)*10
    expect(r.count).toBe(1);
  });
  it("ignora séries não realizadas na contagem e no max/volume", () => {
    const r = statsOf([
      { weight: 20, reps: 10 },
      { weight: "", reps: "" },
      { weight: 25, reps: 8 },
    ]);
    expect(r.count).toBe(2);
    expect(r.max).toBe(25);
  });
});

describe("computeMeta", () => {
  const planItems = [{ id: "supino" }, { id: "agachamento" }];

  it("3 séries preenchidas → 3 contadas", () => {
    const entries = {
      supino: [
        { weight: 20, reps: 10 },
        { weight: 20, reps: 10 },
        { weight: 20, reps: 10 },
      ],
      agachamento: [],
    };
    expect(computeMeta(entries, planItems).totalSets).toBe(3);
  });

  it("3 séries com 1 vazia → 2 contadas", () => {
    const entries = {
      supino: [
        { weight: 20, reps: 10 },
        { weight: "", reps: "" },
        { weight: 20, reps: 10 },
      ],
      agachamento: [],
    };
    expect(computeMeta(entries, planItems).totalSets).toBe(2);
  });

  it("nenhuma série válida → 0 contadas", () => {
    const entries = {
      supino: [{ weight: "", reps: "" }],
      agachamento: [{ weight: 0, reps: 10 }],
    };
    const meta = computeMeta(entries, planItems);
    expect(meta.totalSets).toBe(0);
    expect(meta.totalExercisesCompleted).toBe(0);
  });

  it("múltiplos exercícios: soma correta de séries e exercícios completos", () => {
    const entries = {
      supino: [{ weight: 20, reps: 10 }, { weight: 20, reps: 8 }],
      agachamento: [{ weight: 40, reps: 10 }],
    };
    const meta = computeMeta(entries, planItems);
    expect(meta.totalSets).toBe(3);
    expect(meta.totalExercisesCompleted).toBe(2);
    expect(meta.totalExercisesPlanned).toBe(2);
  });

  it("peso ou reps inválidos não contam como série realizada", () => {
    const entries = {
      supino: [{ weight: "abc", reps: 10 }, { weight: -5, reps: 10 }],
      agachamento: [],
    };
    expect(computeMeta(entries, planItems).totalSets).toBe(0);
  });

  it("treino parcial: só as séries de fato preenchidas contam (proporcional)", () => {
    const entries = {
      supino: [{ weight: 20, reps: 10 }, { weight: "", reps: "" }, { weight: "", reps: "" }],
      agachamento: [{ weight: "", reps: "" }],
    };
    const meta = computeMeta(entries, planItems);
    expect(meta.totalSets).toBe(1);
    expect(meta.totalExercisesCompleted).toBe(1);
  });

  it("treino completo: todas as séries preenchidas são preservadas na contagem", () => {
    const entries = {
      supino: [{ weight: 20, reps: 10 }, { weight: 22, reps: 8 }],
      agachamento: [{ weight: 40, reps: 10 }, { weight: 42, reps: 8 }],
    };
    const meta = computeMeta(entries, planItems);
    expect(meta.totalSets).toBe(4);
    expect(meta.totalExercisesCompleted).toBe(2);
  });
});

describe("computeMusculKcal (bug corrigido: contava linha do form, não série realizada)", () => {
  const body = DEFAULT_BODY; // secPerSet = 150

  it("conta só séries realizadas, não todas as linhas do formulário", () => {
    const entries = {
      supino: [
        { weight: 20, reps: 10 },
        { weight: "", reps: "" }, // linha vazia adicionada mas nunca preenchida
        { weight: "", reps: "" },
      ],
    };
    const r = computeMusculKcal(entries, body);
    expect(r.totalSets).toBe(1);
  });

  it("nenhuma série preenchida → 0 séries, 0 kcal", () => {
    const entries = { supino: [{ weight: "", reps: "" }], agachamento: [] };
    const r = computeMusculKcal(entries, body);
    expect(r.totalSets).toBe(0);
    expect(r.kcal).toBe(0);
    expect(r.durationMin).toBe(0);
  });

  it("múltiplos exercícios: soma correta de séries realizadas", () => {
    const entries = {
      supino: [{ weight: 20, reps: 10 }, { weight: 22, reps: 8 }],
      agachamento: [{ weight: 40, reps: 10 }],
    };
    const r = computeMusculKcal(entries, body);
    expect(r.totalSets).toBe(3);
    expect(r.durationMin).toBeCloseTo((3 * body.secPerSet) / 60, 5);
  });

  it("kcal escala linearmente com séries realizadas (mesmo bodyStats)", () => {
    const oneSet = computeMusculKcal({ a: [{ weight: 20, reps: 10 }] }, body);
    const threeSets = computeMusculKcal(
      { a: [{ weight: 20, reps: 10 }, { weight: 20, reps: 10 }, { weight: 20, reps: 10 }] },
      body
    );
    expect(threeSets.kcal).toBeCloseTo(oneSet.kcal * 3, 5);
  });
});

describe("computeCardioKcal", () => {
  it("retorna 0 quando cardio não foi feito", () => {
    expect(computeCardioKcal({ did: false }, DEFAULT_BODY)).toBe(0);
    expect(computeCardioKcal(null, DEFAULT_BODY)).toBe(0);
  });
  it("retorna 0 para combinação tipo/intensidade desconhecida", () => {
    expect(computeCardioKcal({ did: true, type: "voo", intensity: "leve", minutes: 10 }, DEFAULT_BODY)).toBe(0);
  });
  it("calcula kcal proporcional aos minutos", () => {
    const r = computeCardioKcal({ did: true, type: "caminhada", intensity: "leve", minutes: 30 }, DEFAULT_BODY);
    expect(r).toBeGreaterThan(0);
  });
});

describe("sanitizeWeight / sanitizeReps / sanitizeMinutes (casos extremos)", () => {
  it("0kg é um valor válido", () => {
    expect(sanitizeWeight(0)).toBe(0);
  });
  it("negativo vira vazio", () => {
    expect(sanitizeWeight(-5)).toBe("");
  });
  it("acima do limite é truncado para o máximo (500kg)", () => {
    expect(sanitizeWeight(9999)).toBe(500);
  });
  it("0 reps é um valor válido", () => {
    expect(sanitizeReps(0)).toBe(0);
  });
  it("1 rep é válido", () => {
    expect(sanitizeReps(1)).toBe(1);
  });
  it("30 reps é válido, 31 é truncado no limite de sanitização (100)", () => {
    expect(sanitizeReps(30)).toBe(30);
    expect(sanitizeReps(31)).toBe(31);
  });
  it("reps negativos viram vazio", () => {
    expect(sanitizeReps(-1)).toBe("");
  });
});
