import { describe, it, expect } from "vitest";
import {
  buildCumulative,
  levelFromCumXP,
  xpProgress,
  multiplicadorStreak,
  xpDisciplinaSemana,
  resolveWeekStreak,
  fatorVolumeRpg,
  computePerformanceXPRpg,
  computeCaloriasXPRpg,
  computeEvolucaoXPRpg,
  rankForAscensao,
  computePlayerStateEngine,
  detectLevelUps,
} from "./xp.js";
import { computeWeekPayload } from "./week.js";
import { RPG_CONFIG } from "../constants/config.js";

// ---------------------------------------------------------------------------
// Nível / progressão de XP
// ---------------------------------------------------------------------------
describe("buildCumulative / levelFromCumXP / xpProgress", () => {
  const cum = buildCumulative(100, 1.5, 10);

  it("XP abaixo do próximo nível: permanece no nível atual", () => {
    expect(levelFromCumXP(cum[1] - 1, cum)).toBe(0);
  });
  it("XP exatamente no limite do próximo nível: já conta como o próximo nível", () => {
    expect(levelFromCumXP(cum[1], cum)).toBe(1);
  });
  it("cruzamento de nível: XP logo após o limite sobe de nível", () => {
    expect(levelFromCumXP(cum[1] + 1, cum)).toBe(1);
  });
  it("XP muito alto sobe múltiplos níveis de uma vez", () => {
    expect(levelFromCumXP(cum[5], cum)).toBe(5);
  });
  it("nível máximo: XP acima do topo da curva não ultrapassa o último nível definido", () => {
    expect(levelFromCumXP(cum[10] * 100, cum)).toBe(10);
  });
  it("xpProgress calcula xpAtual e xpNecessario relativos ao nível", () => {
    const p = xpProgress(cum[2] + 10, cum);
    expect(p.nivel).toBe(2);
    expect(p.xpAtual).toBe(10);
    expect(p.xpNecessario).toBe(Math.round(cum[3] - cum[2]));
  });
});

// ---------------------------------------------------------------------------
// Streak / multiplicador
// ---------------------------------------------------------------------------
describe("multiplicadorStreak", () => {
  it("streak 0 usa o multiplicador base (1.0)", () => {
    expect(multiplicadorStreak(0)).toBe(RPG_CONFIG.MULTIPLICADOR_STREAK_BASE);
  });
  it("multiplicador cresce com o streak", () => {
    expect(multiplicadorStreak(5)).toBeGreaterThan(multiplicadorStreak(2));
  });
  it("multiplicador tem teto (não ultrapassa MULTIPLICADOR_STREAK_TETO mesmo com streak absurdo)", () => {
    expect(multiplicadorStreak(9999)).toBe(RPG_CONFIG.MULTIPLICADOR_STREAK_TETO);
  });
});

describe("resolveWeekStreak", () => {
  const freshState = () => ({
    streakAtual: 0, streakMaxima: 0, escudos: 0, escudoCooldown: 0, semanasPerfeitasTotal: 0,
    aguardandoRessurgimento: false, semanasPerfeitasPosRetorno: 0, escudosConquistadosTotal: 0,
  });

  it("primeiro treino/primeira semana perfeita: streak vira 1", () => {
    const r = resolveWeekStreak(1, true, freshState());
    expect(r.newState.streakAtual).toBe(1);
    expect(r.newState.streakMaxima).toBe(1);
  });

  it("semana perfeita consecutiva incrementa o streak", () => {
    let state = freshState();
    state = resolveWeekStreak(1, true, state).newState;
    state = resolveWeekStreak(1, true, state).newState;
    expect(state.streakAtual).toBe(2);
  });

  it("semana incompleta sem escudo disponível quebra o streak", () => {
    let state = freshState();
    state = resolveWeekStreak(1, true, state).newState;
    const r = resolveWeekStreak(0.5, false, state);
    expect(r.streakQuebrou).toBe(true);
    expect(r.newState.streakAtual).toBe(0);
  });

  it("escudo disponível protege o streak numa semana incompleta (não quebra, consome o escudo)", () => {
    let state = { ...freshState(), streakAtual: 3, streakMaxima: 3, escudos: 1 };
    const r = resolveWeekStreak(0.5, false, state);
    expect(r.usouEscudo).toBe(true);
    expect(r.streakQuebrou).toBe(false);
    expect(r.newState.streakAtual).toBe(3);
    expect(r.newState.escudos).toBe(0);
  });

  it("escudo em cooldown não pode ser usado na mesma semana em que seria necessário", () => {
    let state = { ...freshState(), streakAtual: 3, streakMaxima: 3, escudos: 1, escudoCooldown: 1 };
    const r = resolveWeekStreak(0.5, false, state);
    expect(r.usouEscudo).toBe(false);
    expect(r.streakQuebrou).toBe(true);
  });

  it("conquista de escudo: streak atinge ESCUDO_SEMANAS_NECESSARIAS em semana perfeita", () => {
    let state = { ...freshState(), streakAtual: RPG_CONFIG.ESCUDO_SEMANAS_NECESSARIAS - 1, streakMaxima: RPG_CONFIG.ESCUDO_SEMANAS_NECESSARIAS - 1 };
    const r = resolveWeekStreak(1, true, state);
    expect(r.escudoGanhoAgora).toBe(true);
    expect(r.newState.escudos).toBe(1);
  });

  it("armazenamento de escudos respeita o limite máximo (ESCUDO_MAXIMO_ARMAZENADO)", () => {
    let state = {
      ...freshState(),
      streakAtual: RPG_CONFIG.ESCUDO_SEMANAS_NECESSARIAS - 1,
      streakMaxima: RPG_CONFIG.ESCUDO_SEMANAS_NECESSARIAS - 1,
      escudos: RPG_CONFIG.ESCUDO_MAXIMO_ARMAZENADO,
    };
    const r = resolveWeekStreak(1, true, state);
    expect(r.newState.escudos).toBe(RPG_CONFIG.ESCUDO_MAXIMO_ARMAZENADO);
  });

  it("streak máxima registra o maior valor já alcançado, mesmo após quebra", () => {
    let state = freshState();
    state = resolveWeekStreak(1, true, state).newState;
    state = resolveWeekStreak(1, true, state).newState;
    state = resolveWeekStreak(1, true, state).newState; // streak = 3 (ganha 1 escudo automaticamente aqui)
    state = { ...state, escudos: 0 }; // sem escudo disponível no momento da quebra
    state = resolveWeekStreak(0, false, state).newState;
    expect(state.streakAtual).toBe(0);
    expect(state.streakMaxima).toBe(3);
  });

  it("ressurgimento: streak quebrada (>= mínima) e recuperada após N semanas perfeitas gera bônus de XP", () => {
    let state = freshState();
    for (let i = 0; i < RPG_CONFIG.RETORNO_STREAK_MINIMA_QUEBRADA; i++) {
      state = resolveWeekStreak(1, true, state).newState;
    }
    state = { ...state, escudos: 0 }; // sem escudo disponível no momento da quebra
    let r = resolveWeekStreak(0, false, state); // quebra streak alta
    state = r.newState;
    expect(state.aguardandoRessurgimento).toBe(true);
    for (let i = 0; i < RPG_CONFIG.RETORNO_SEMANAS_PARA_BONUS; i++) {
      r = resolveWeekStreak(1, true, state);
      state = r.newState;
    }
    expect(r.ressurgiuAgora).toBe(true);
    expect(r.xpRetornoBonus).toBe(RPG_CONFIG.RETORNO_XP_BONUS);
  });

  it("semana perfeita: XP de consistência e disciplina incluem o bônus de semana perfeita", () => {
    const comBonus = xpDisciplinaSemana(1, 0, true);
    const semBonus = xpDisciplinaSemana(1, 0, false);
    expect(comBonus - semBonus).toBe(RPG_CONFIG.BONUS_SEMANA_PERFEITA);
  });
});

// ---------------------------------------------------------------------------
// Performance XP / PR / carga unilateral
// ---------------------------------------------------------------------------
describe("fatorVolumeRpg", () => {
  it("até o limite cheio: fator 1.0", () => {
    expect(fatorVolumeRpg(RPG_CONFIG.SERIES_LIMITE_FULL_XP)).toBe(1.0);
  });
  it("acima do limite cheio: fator reduzido (0.8)", () => {
    expect(fatorVolumeRpg(RPG_CONFIG.SERIES_LIMITE_FULL_XP + 1)).toBe(0.8);
  });
  it("acima do limite parcial: fator mais reduzido (0.5)", () => {
    expect(fatorVolumeRpg(RPG_CONFIG.SERIES_LIMITE_PARCIAL_XP + 1)).toBe(0.5);
  });
  it("acima do limite zero: XP zerado", () => {
    expect(fatorVolumeRpg(RPG_CONFIG.SERIES_LIMITE_ZERO_XP + 1)).toBe(0.0);
  });
});

describe("computePerformanceXPRpg — unidade de carga vs. volume no fator de PR", () => {
  it("sem PR anterior: fator neutro, XP proporcional ao volume", () => {
    const sets = [{ exId: "a", weight: 20, loadWeight: 20, reps: 10 }];
    const r = computePerformanceXPRpg(sets, {}, 0);
    expect(r.volumeTotalTreino).toBe(200);
    expect(r.xpPerformance).toBeGreaterThan(0);
  });

  it("carga (loadWeight) igual ao PR: sem penalidade de 'carga muito abaixo do normal'", () => {
    const sets = [{ exId: "a", weight: 20, loadWeight: 20, reps: 10 }];
    const r = computePerformanceXPRpg(sets, { a: 20 }, 0);
    const rSemPR = computePerformanceXPRpg(sets, {}, 0);
    expect(r.volumeTotalTreino).toBe(rSemPR.volumeTotalTreino);
  });

  it("carga abaixo de 30% do PR: fator de penalidade forte aplicado", () => {
    const sets = [{ exId: "a", weight: 5, loadWeight: 5, reps: 10 }];
    const r = computePerformanceXPRpg(sets, { a: 100 }, 0);
    expect(r.volumeTotalTreino).toBe(5 * 10 * RPG_CONFIG.CARGA_MINIMA_XP_30);
  });

  it("carga entre 30% e 50% do PR: penalidade intermediária", () => {
    const sets = [{ exId: "a", weight: 40, loadWeight: 40, reps: 10 }];
    const r = computePerformanceXPRpg(sets, { a: 100 }, 0);
    expect(r.volumeTotalTreino).toBe(40 * 10 * RPG_CONFIG.CARGA_MINIMA_XP_50);
  });

  it("BUG REGRESSIVO: série unilateral com E=D não deve escapar da penalidade de carga baixa por comparar volume (E+D) contra um PR de carga", () => {
    // Antes da correção, loadWeight não existia e o pct usava `weight`
    // (volume, E+D=10). Com PR=100 (carga), pct=10/100=10%, ainda cairia na
    // faixa <30%, então este cenário específico não expunha o bug — o que
    // expõe é comparar corretamente pela carga de um lado (5), que também
    // fica bem abaixo de 30%, confirmando que a penalidade continua ativa.
    const sets = [{ exId: "a", weight: 10, loadWeight: 5, reps: 10 }]; // 5kg E + 5kg D
    const r = computePerformanceXPRpg(sets, { a: 100 }, 0);
    // pct = loadWeight/pr = 5/100 = 5% -> fator CARGA_MINIMA_XP_30, aplicado sobre o VOLUME (weight=10)
    expect(r.volumeTotalTreino).toBe(10 * 10 * RPG_CONFIG.CARGA_MINIMA_XP_30);
  });

  it("sem loadWeight informado, cai de volta para weight (compatibilidade)", () => {
    const sets = [{ exId: "a", weight: 100, reps: 10 }];
    const r = computePerformanceXPRpg(sets, { a: 100 }, 0);
    expect(r.volumeTotalTreino).toBe(1000); // pct=100/100=100% -> fator 1.0
  });

  it("reps por série são limitadas ao teto (REPS_LIMITE_POR_SERIE) mesmo se o usuário digitar mais", () => {
    const normal = computePerformanceXPRpg([{ exId: "a", weight: 20, loadWeight: 20, reps: RPG_CONFIG.REPS_LIMITE_POR_SERIE }], {}, 0);
    const excesso = computePerformanceXPRpg([{ exId: "a", weight: 20, loadWeight: 20, reps: RPG_CONFIG.REPS_LIMITE_POR_SERIE + 50 }], {}, 0);
    expect(excesso.volumeTotalTreino).toBe(normal.volumeTotalTreino);
  });

  it("XP de performance nunca ultrapassa o teto XP_MAX_PERFORMANCE_POR_TREINO", () => {
    const sets = Array.from({ length: 10 }, (_, i) => ({ exId: "a" + i, weight: 500, loadWeight: 500, reps: 30 }));
    const r = computePerformanceXPRpg(sets, {}, 5000);
    expect(r.xpPerformance).toBeLessThanOrEqual(RPG_CONFIG.XP_MAX_PERFORMANCE_POR_TREINO);
  });
});

describe("computeCaloriasXPRpg", () => {
  it("0 calorias gera 0 XP", () => {
    expect(computeCaloriasXPRpg(0)).toBe(0);
  });
  it("XP cresce linearmente até o limiar de diminishing returns", () => {
    expect(computeCaloriasXPRpg(500)).toBeCloseTo(25, 5);
  });
  it("acima do limiar, XP cresce mais devagar (diminishing returns)", () => {
    const antes = computeCaloriasXPRpg(RPG_CONFIG.CALORIAS_DIMINISHING_APOS);
    const depoisMesmoIncremento = computeCaloriasXPRpg(RPG_CONFIG.CALORIAS_DIMINISHING_APOS + 500) - antes;
    expect(depoisMesmoIncremento).toBeLessThan(25);
  });
  it("XP de calorias nunca ultrapassa o teto XP_MAX_CALORIAS_POR_TREINO", () => {
    expect(computeCaloriasXPRpg(999999)).toBe(RPG_CONFIG.XP_MAX_CALORIAS_POR_TREINO);
  });
});

describe("computeEvolucaoXPRpg", () => {
  it("progressão válida (acima do mínimo percentual): gera XP de evolução", () => {
    const hist = { a: [{ date: "d1", max: 100 }] };
    const r = computeEvolucaoXPRpg(["a"], { a: 110 }, hist); // +10%
    expect(r.xpEvolucao).toBeGreaterThan(0);
  });
  it("aumento absurdo é limitado pelo fator máximo (EVOLUCAO_FATOR_MAX), não escala infinitamente", () => {
    const hist = { a: [{ date: "d1", max: 10 }] };
    const rNormal = computeEvolucaoXPRpg(["a"], { a: 11 }, hist); // +10%
    const rAbsurdo = computeEvolucaoXPRpg(["a"], { a: 10000 }, hist); // +99900%
    expect(rAbsurdo.contribs[0].xp).toBe(RPG_CONFIG.XP_EXERCICIO_BASE_EVOLUCAO * RPG_CONFIG.EVOLUCAO_FATOR_MAX);
    expect(rAbsurdo.contribs[0].xp).toBeGreaterThan(rNormal.contribs[0].xp);
  });
  it("progressão abaixo do mínimo percentual (EVOLUCAO_MIN_PCT) não gera XP", () => {
    const hist = { a: [{ date: "d1", max: 100 }] };
    const r = computeEvolucaoXPRpg(["a"], { a: 100.5 }, hist); // +0.5%, abaixo do mínimo (2.5%)
    expect(r.xpEvolucao).toBe(0);
  });
  it("sem histórico anterior: não há base de comparação, sem XP de evolução", () => {
    const r = computeEvolucaoXPRpg(["a"], { a: 100 }, {});
    expect(r.xpEvolucao).toBe(0);
  });
  it("limita a no máximo MAX_EXERCICIOS_EVOLUCAO contribuições, priorizando as maiores", () => {
    const hist = {};
    const carga = {};
    const ids = [];
    for (let i = 0; i < 8; i++) {
      const id = "ex" + i;
      ids.push(id);
      hist[id] = [{ date: "d1", max: 100 }];
      carga[id] = 100 + (i + 1) * 10; // deltas crescentes
    }
    const r = computeEvolucaoXPRpg(ids, carga, hist);
    expect(r.contribs.length).toBe(RPG_CONFIG.MAX_EXERCICIOS_EVOLUCAO);
    expect(r.contribs[0].exId).toBe("ex7"); // maior delta primeiro
  });
});

// ---------------------------------------------------------------------------
// Motor completo (computePlayerStateEngine) — integração
// ---------------------------------------------------------------------------
describe("computePlayerStateEngine — integração", () => {
  it("treino bilateral simples gera XP > 0 e registra PR de carga", () => {
    const plan = { seg: { items: [{ id: "supino" }] } };
    const logs = {
      "2026-08-10": {
        status: "completed",
        exercises: { supino: { sets: [{ weight: 40, reps: 10 }] } },
        kcal: 300,
        meta: { totalVolume: 400 },
      },
    };
    const weeks = { "2026-W33": computeWeekPayload("2026-W33", plan, logs) };
    const r = computePlayerStateEngine(logs, weeks);
    expect(r.totalTreinosCompletos).toBe(1);
    expect(r.maxCargaGeral).toBe(40);
    expect(r.xp + r.nivel).toBeGreaterThan(0);
  });

  it("exercício unilateral com E=10kg/D=10kg: PR de carga registra 10kg (não 20kg)", () => {
    const plan = { seg: { items: [{ id: "rosca" }] } };
    const logs = {
      "2026-08-10": {
        status: "completed",
        exercises: { rosca: { sets: [{ weight: 10, weightD: 10, reps: 10 }] } },
        kcal: 200,
        meta: { totalVolume: 200 },
      },
    };
    const weeks = { "2026-W33": computeWeekPayload("2026-W33", plan, logs) };
    const r = computePlayerStateEngine(logs, weeks);
    expect(r.maxCargaGeral).toBe(10);
  });

  it("exercício unilateral com lados diferentes: PR de carga usa o lado mais pesado", () => {
    const plan = { seg: { items: [{ id: "rosca" }] } };
    const logs = {
      "2026-08-10": {
        status: "completed",
        exercises: { rosca: { sets: [{ weight: 8, weightD: 14, reps: 10 }] } },
        kcal: 200,
        meta: { totalVolume: 220 },
      },
    };
    const weeks = { "2026-W33": computeWeekPayload("2026-W33", plan, logs) };
    const r = computePlayerStateEngine(logs, weeks);
    expect(r.maxCargaGeral).toBe(14);
  });

  it("unilateral só do lado esquerdo (direito vazio/0): PR usa o lado preenchido", () => {
    const plan = { seg: { items: [{ id: "rosca" }] } };
    const logs = {
      "2026-08-10": {
        status: "completed",
        exercises: { rosca: { sets: [{ weight: 12, weightD: 0, reps: 10 }] } },
        kcal: 200,
        meta: { totalVolume: 120 },
      },
    };
    const weeks = { "2026-W33": computeWeekPayload("2026-W33", plan, logs) };
    const r = computePlayerStateEngine(logs, weeks);
    expect(r.maxCargaGeral).toBe(12);
  });

  it("segundo treino com carga válida (dentro do limite) registra novo PR sem sinalizar como suspeito", () => {
    const plan = { seg: { items: [{ id: "supino" }] } };
    const logs = {
      "2026-08-03": {
        status: "completed",
        exercises: { supino: { sets: [{ weight: 40, reps: 10 }] } },
        kcal: 300,
        meta: { totalVolume: 400 },
      },
      "2026-08-10": {
        status: "completed",
        exercises: { supino: { sets: [{ weight: 42, reps: 10 }] } }, // +5%
        kcal: 300,
        meta: { totalVolume: 420 },
      },
    };
    const weeks = {
      "2026-W32": computeWeekPayload("2026-W32", plan, { "2026-08-03": logs["2026-08-03"] }),
      "2026-W33": computeWeekPayload("2026-W33", plan, { "2026-08-10": logs["2026-08-10"] }),
    };
    const r = computePlayerStateEngine(logs, weeks);
    expect(r.totalPRs).toBe(1); // conta o primeiro registro do 2º treino como PR válido
    expect(r.flagsByDate["2026-08-10"]).toEqual([]);
  });

  it("aumento de carga acima do limite válido (PR_AUMENTO_MAX_VALIDO_PCT) é sinalizado, não contado como PR", () => {
    const plan = { seg: { items: [{ id: "supino" }] } };
    const logs = {
      "2026-08-03": {
        status: "completed",
        exercises: { supino: { sets: [{ weight: 40, reps: 10 }] } },
        kcal: 300,
        meta: { totalVolume: 400 },
      },
      "2026-08-10": {
        status: "completed",
        exercises: { supino: { sets: [{ weight: 100, reps: 10 }] } }, // +150%, provável erro de digitação
        kcal: 300,
        meta: { totalVolume: 1000 },
      },
    };
    const weeks = {
      "2026-W32": computeWeekPayload("2026-W32", plan, { "2026-08-03": logs["2026-08-03"] }),
      "2026-W33": computeWeekPayload("2026-W33", plan, { "2026-08-10": logs["2026-08-10"] }),
    };
    const r = computePlayerStateEngine(logs, weeks);
    expect(r.totalPRs).toBe(0);
    expect(r.flagsByDate["2026-08-10"].length).toBeGreaterThan(0);
  });

  it("sem histórico algum (primeiro treino de sempre): não lança erro e retorna estado consistente", () => {
    const logs = {};
    const weeks = {};
    const r = computePlayerStateEngine(logs, weeks);
    expect(r.totalTreinosCompletos).toBe(0);
    expect(r.nivel).toBe(0);
    expect(r.maxCargaGeral).toBe(0);
  });

  it("logs com status 'skipped' são ignorados no cômputo de treinos completos", () => {
    const logs = { "2026-08-10": { status: "skipped", exercises: {} } };
    const r = computePlayerStateEngine(logs, {});
    expect(r.totalTreinosCompletos).toBe(0);
  });
});

describe("detectLevelUps", () => {
  it("sem estado anterior: não dispara evento", () => {
    expect(detectLevelUps(null, { nivel: 1, ascensaoCount: 0, atributos: {} })).toBeNull();
  });
  it("nível sobe: dispara evento com de/para corretos", () => {
    const prev = { nivel: 1, ascensaoCount: 0, atributos: { forca: { nivel: 1 } } };
    const next = { nivel: 2, ascensaoCount: 0, atributos: { forca: { nivel: 2 } } };
    const ev = detectLevelUps(prev, next);
    expect(ev).toEqual({ de: 1, para: 2, atributos: ["forca"] });
  });
  it("nível não muda: não dispara evento", () => {
    const prev = { nivel: 3, ascensaoCount: 0, atributos: {} };
    const next = { nivel: 3, ascensaoCount: 0, atributos: {} };
    expect(detectLevelUps(prev, next)).toBeNull();
  });
  it("ascensão (nível reseta): não é tratada como level up", () => {
    const prev = { nivel: 99, ascensaoCount: 0, atributos: {} };
    const next = { nivel: 1, ascensaoCount: 1, atributos: {} };
    expect(detectLevelUps(prev, next)).toBeNull();
  });
});

describe("rankForAscensao", () => {
  it("ascensão 0 usa a primeira patente", () => {
    expect(rankForAscensao(0)).toBe("NOVATO I");
  });
  it("ascensão acima do total de patentes não estoura o array (usa a última)", () => {
    expect(rankForAscensao(9999)).toBe("LENDÁRIO II");
  });
});
