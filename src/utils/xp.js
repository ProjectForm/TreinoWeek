import { RPG_CONFIG, RANKS } from "../constants/config.js";
import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { ACHIEVEMENT_DEFS, TITULO_DEFS } from "../constants/achievements.js";
import { tonnageOf, effectiveWeight } from "./stats.js";
import { getWeekKey } from "./dates.js";

export function buildCumulative(base, exp, maxN) {
  const cum = [0];
  for (let i = 1; i <= maxN; i++) cum[i] = base * Math.pow(i, exp);
  return cum;
}

export function levelFromCumXP(xp, cumArray) {
  let n = 0;
  while (n < cumArray.length - 1 && cumArray[n + 1] <= xp) n++;
  return n;
}

export function xpProgress(xp, cumArray) {
  const nivel = levelFromCumXP(xp, cumArray);
  const atual = xp - cumArray[nivel];
  const necessario = nivel < 100 ? cumArray[nivel + 1] - cumArray[nivel] : 0;
  return { nivel, xpAtual: Math.round(atual), xpNecessario: Math.round(necessario) };
}

export function multiplicadorStreak(streak) {
  const m = RPG_CONFIG.MULTIPLICADOR_STREAK_BASE + Math.min(streak, RPG_CONFIG.STREAK_MAXIMO_CALCULO) * RPG_CONFIG.MULTIPLICADOR_STREAK_INCREMENTO;
  return Math.min(m, RPG_CONFIG.MULTIPLICADOR_STREAK_TETO);
}

export function xpConsistenciaSemana(completude, streak) {
  return RPG_CONFIG.BASE_SEMANA_CONSISTENCIA * completude * multiplicadorStreak(streak);
}

export function xpDisciplinaSemana(completude, streak, isPerfect) {
  const bonusStreak = Math.min(RPG_CONFIG.BONUS_STREAK_DISCIPLINA_MAX, RPG_CONFIG.BONUS_STREAK_DISCIPLINA_PER * streak);
  const bonusPerfeita = isPerfect ? RPG_CONFIG.BONUS_SEMANA_PERFEITA : 0;
  return RPG_CONFIG.BASE_DISCIPLINA * completude + bonusStreak + bonusPerfeita;
}

export function resolveWeekStreak(completude, isPerfect, state) {
  let { streakAtual, streakMaxima, escudos, escudoCooldown, semanasPerfeitasTotal,
    aguardandoRessurgimento, semanasPerfeitasPosRetorno, escudosConquistadosTotal } = state;
  let usouEscudo = false, streakQuebrou = false, ressurgiuAgora = false, escudoGanhoAgora = false;
  const streakAntes = streakAtual;

  if (isPerfect) {
    streakAtual = streakAtual + 1;
    semanasPerfeitasTotal++;
  } else if (escudos > 0 && escudoCooldown <= 0) {
    usouEscudo = true;
    escudos -= 1;
    escudoCooldown = RPG_CONFIG.ESCUDO_COOLDOWN_SEMANAS;
  } else {
    streakQuebrou = streakAtual > 0;
    streakAtual = 0;
  }
  if (!usouEscudo && escudoCooldown > 0) escudoCooldown--;

  if (isPerfect && streakAtual >= RPG_CONFIG.ESCUDO_SEMANAS_NECESSARIAS &&
    (streakAtual - RPG_CONFIG.ESCUDO_SEMANAS_NECESSARIAS) % 3 === 0 &&
    escudos < RPG_CONFIG.ESCUDO_MAXIMO_ARMAZENADO) {
    escudos++;
    escudosConquistadosTotal++;
    escudoGanhoAgora = true;
  }
  streakMaxima = Math.max(streakMaxima, streakAtual);

  let xpRetornoBonus = 0;
  if (streakQuebrou && streakAntes >= RPG_CONFIG.RETORNO_STREAK_MINIMA_QUEBRADA) {
    aguardandoRessurgimento = true;
    semanasPerfeitasPosRetorno = 0;
  }
  if (aguardandoRessurgimento && !streakQuebrou) {
    if (isPerfect) {
      semanasPerfeitasPosRetorno++;
      if (semanasPerfeitasPosRetorno >= RPG_CONFIG.RETORNO_SEMANAS_PARA_BONUS) {
        xpRetornoBonus = RPG_CONFIG.RETORNO_XP_BONUS;
        ressurgiuAgora = true;
        aguardandoRessurgimento = false;
      }
    } else {
      semanasPerfeitasPosRetorno = 0;
    }
  }
  return {
    newState: { streakAtual, streakMaxima, escudos, escudoCooldown, semanasPerfeitasTotal, aguardandoRessurgimento, semanasPerfeitasPosRetorno, escudosConquistadosTotal },
    usouEscudo, streakQuebrou, ressurgiuAgora, xpRetornoBonus, escudoGanhoAgora,
  };
}

export function fatorVolumeRpg(seriesTotais) {
  let f = 1.0;
  if (seriesTotais > RPG_CONFIG.SERIES_LIMITE_FULL_XP) f = 0.8;
  if (seriesTotais > RPG_CONFIG.SERIES_LIMITE_PARCIAL_XP) f = 0.5;
  if (seriesTotais > RPG_CONFIG.SERIES_LIMITE_ZERO_XP) f = 0.0;
  return f;
}

export function computePerformanceXPRpg(sets, recordesPR, kcalTreino) {
  let volumeTotalTreino = 0;
  sets.forEach((s) => {
    const repsContadas = Math.min(s.reps, RPG_CONFIG.REPS_LIMITE_POR_SERIE);
    const pr = recordesPR[s.exId] || 0;
    let fator = 1.0;
    if (pr > 0) {
      const pct = s.weight / pr;
      if (pct < RPG_CONFIG.CARGA_MINIMA_PCT_30) fator = RPG_CONFIG.CARGA_MINIMA_XP_30;
      else if (pct < RPG_CONFIG.CARGA_MINIMA_PCT_50) fator = RPG_CONFIG.CARGA_MINIMA_XP_50;
    }
    volumeTotalTreino += s.weight * repsContadas * fator;
  });
  const fatorIntensidade = Math.min(1.5, 1 + kcalTreino / 2000);
  const bruto = (volumeTotalTreino / 1000) * fatorIntensidade;
  const fVolume = fatorVolumeRpg(sets.length);
  const xpPerformance = Math.min(RPG_CONFIG.XP_MAX_PERFORMANCE_POR_TREINO, bruto * fVolume);
  return { xpPerformance, volumeTotalTreino };
}

export function computeCaloriasXPRpg(kcalTreino) {
  let xp;
  if (kcalTreino <= RPG_CONFIG.CALORIAS_DIMINISHING_APOS) xp = (kcalTreino / 500) * 25;
  else {
    const base = (RPG_CONFIG.CALORIAS_DIMINISHING_APOS / 500) * 25;
    const extra = ((kcalTreino - RPG_CONFIG.CALORIAS_DIMINISHING_APOS) / 500) * 25 * RPG_CONFIG.CALORIAS_DIMINISHING_FATOR;
    xp = base + extra;
  }
  return Math.min(RPG_CONFIG.XP_MAX_CALORIAS_POR_TREINO, xp);
}

export function computeEvolucaoXPRpg(exIds, cargaAtualPorExercicio, historicoPorExercicio) {
  const contribs = [];
  exIds.forEach((id) => {
    const hist = historicoPorExercicio[id] || [];
    if (hist.length === 0) return;
    const recentes = hist.slice(-8);
    const media = recentes.reduce((a, h) => a + h.max, 0) / recentes.length;
    if (media <= 0) return;
    const cargaAtual = cargaAtualPorExercicio[id];
    const delta = (cargaAtual - media) / media;
    if (delta < RPG_CONFIG.EVOLUCAO_MIN_PCT) return;
    const fator = Math.min(RPG_CONFIG.EVOLUCAO_FATOR_MAX, delta);
    contribs.push({ exId: id, xp: RPG_CONFIG.XP_EXERCICIO_BASE_EVOLUCAO * fator });
  });
  contribs.sort((a, b) => b.xp - a.xp);
  const top5 = contribs.slice(0, RPG_CONFIG.MAX_EXERCICIOS_EVOLUCAO);
  return { xpEvolucao: top5.reduce((a, c) => a + c.xp, 0), contribs: top5 };
}

export function rankForAscensao(n) { return RANKS[Math.min(n, RANKS.length - 1)]; }

export const MAIN_CUM = buildCumulative(RPG_CONFIG.XP_BASE_NIVEL, RPG_CONFIG.CURVA_EXPONENTE, 100);

export const ATTR_CUM = buildCumulative(RPG_CONFIG.XP_NIVEL_ATRIBUTO_BASE, RPG_CONFIG.XP_NIVEL_ATRIBUTO_EXP, 100);

export function computePlayerStateEngine(logs, weeks) {
  const sortedDates = Object.keys(logs).filter((d) => logs[d].status !== "skipped").sort();
  let xpTotalFase = 0, ascensaoCount = 0;
  let streakState = {
    streakAtual: 0, streakMaxima: 0, escudos: 0, escudoCooldown: 0, semanasPerfeitasTotal: 0,
    aguardandoRessurgimento: false, semanasPerfeitasPosRetorno: 0, escudosConquistadosTotal: 0,
  };
  const recordesPR = {};
  const historicoPorExercicio = {};
  const atributosXP = { forca: 0, condicionamento: 0, disciplina: 0, consistencia: 0 };
  const musculosXP = {}; GROUP_ORDER.forEach((g) => (musculosXP[g] = 0));
  const weekGroupSessionCount = {};
  const historicoAscensoes = [];
  const narrativesByDate = {};
  const flagsByDate = {};
  let totalTreinosCompletos = 0, totalPRs = 0, maxCargaGeral = 0, volumeRecordeSessao = 0, volumeVidaToda = 0;
  let teveRessurgimento = false;
  let lastWeekXPBreakdown = null;

  function ascensaoBonusMult() {
    return 1 + Math.min(RPG_CONFIG.ASCENSAO_BONUS_XP_TETO, ascensaoCount * RPG_CONFIG.ASCENSAO_BONUS_XP_PERCENTUAL);
  }
  function checkAscensao(dataRef) {
    while (xpTotalFase >= MAIN_CUM[100]) {
      xpTotalFase -= MAIN_CUM[100];
      ascensaoCount++;
      historicoAscensoes.push({ numero: ascensaoCount, de: rankForAscensao(ascensaoCount - 1), para: rankForAscensao(ascensaoCount), data: dataRef, streakMaxima: streakState.streakMaxima });
    }
  }

  let currentWeekKey = null;
  let weekDailyXP = 0;

  function flushWeek(weekKey, dateRef) {
    if (!weekKey || !weeks[weekKey]) return;
    const wp = weeks[weekKey];
    const completude = wp.plannedDays.length > 0 ? wp.completedDays.length / wp.plannedDays.length : 0;
    const isPerfect = wp.perfectWeek;
    const r = resolveWeekStreak(completude, isPerfect, streakState);
    streakState = r.newState;
    if (r.ressurgiuAgora) teveRessurgimento = true;

    const xpCons = xpConsistenciaSemana(completude, streakState.streakAtual);
    const xpDisc = xpDisciplinaSemana(completude, streakState.streakAtual, isPerfect) + r.xpRetornoBonus;
    atributosXP.consistencia += xpCons * ascensaoBonusMult();
    atributosXP.disciplina += xpDisc * ascensaoBonusMult();

    let weekTotal = (weekDailyXP + xpCons + xpDisc) * ascensaoBonusMult();
    weekTotal = Math.min(RPG_CONFIG.XP_MAX_SEMANAL, weekTotal);
    xpTotalFase += weekTotal;
    lastWeekXPBreakdown = { weekKey, xpCons, xpDisc, xpSessoes: weekDailyXP, isPerfect, usouEscudo: r.usouEscudo, escudoGanhoAgora: r.escudoGanhoAgora, ressurgiuAgora: r.ressurgiuAgora, xpRetornoBonus: r.xpRetornoBonus, streakAtual: streakState.streakAtual, multiplicador: multiplicadorStreak(streakState.streakAtual) };
    checkAscensao(dateRef);
    weekDailyXP = 0;
  }

  sortedDates.forEach((date) => {
    const wk = getWeekKey(date);
    if (currentWeekKey !== null && wk !== currentWeekKey) flushWeek(currentWeekKey, date);
    currentWeekKey = wk;
    weekGroupSessionCount[wk] = weekGroupSessionCount[wk] || {};

    const data = logs[date];
    const exIds = Object.keys(data.exercises || {}).filter((id) => tonnageOf(data.exercises[id].sets) > 0);
    if (exIds.length === 0) return;
    const sets = [];
    exIds.forEach((id) => (data.exercises[id].sets || []).forEach((s) => {
      const w = effectiveWeight(s), rp = parseFloat(s.reps) || 0;
      if (w > 0) sets.push({ exId: id, weight: w, reps: rp });
    }));
    totalTreinosCompletos++;

    const kcalTreino = data.kcal || 0;
    const perf = computePerformanceXPRpg(sets, recordesPR, kcalTreino);
    const cal = computeCaloriasXPRpg(kcalTreino);
    const cargaAtualPorExercicio = {};
    exIds.forEach((id) => {
      cargaAtualPorExercicio[id] = Math.max.apply(null, (data.exercises[id].sets || []).map((s) => effectiveWeight(s)));
    });
    const evo = computeEvolucaoXPRpg(exIds, cargaAtualPorExercicio, historicoPorExercicio);

    weekDailyXP += (perf.xpPerformance + cal + evo.xpEvolucao) * ascensaoBonusMult();
    atributosXP.forca += (perf.xpPerformance + evo.xpEvolucao) * ascensaoBonusMult();
    atributosXP.condicionamento += cal * ascensaoBonusMult();
    volumeRecordeSessao = Math.max(volumeRecordeSessao, perf.volumeTotalTreino);
    volumeVidaToda += data.meta ? data.meta.totalVolume || 0 : perf.volumeTotalTreino;

    const gv = data.groupVolumes || {};
    const totalGV = Object.values(gv).reduce((a, b) => a + b, 0);
    if (totalGV > 0) {
      GROUP_ORDER.forEach((g) => {
        const share = (gv[g] || 0) / totalGV;
        let xpG = Math.min(RPG_CONFIG.XP_MAX_MUSCULAR_POR_TREINO, perf.xpPerformance * share);
        const sessoesAntes = weekGroupSessionCount[wk][g] || 0;
        if (sessoesAntes >= 2) xpG *= RPG_CONFIG.MUSCULO_FATOR_REDUCAO_3X;
        musculosXP[g] += xpG * ascensaoBonusMult();
        if (xpG > 0) weekGroupSessionCount[wk][g] = sessoesAntes + 1;
      });
    }

    const narratives = [], flags = [];
    exIds.forEach((id) => {
      const maxHoje = cargaAtualPorExercicio[id];
      const prAntes = recordesPR[id] || 0;
      if (maxHoje > prAntes) {
        if (prAntes > 0) {
          const aumentoPct = (maxHoje - prAntes) / prAntes;
          if (aumentoPct <= RPG_CONFIG.PR_AUMENTO_MAX_VALIDO_PCT) {
            narratives.push({ type: "pr", exId: id, delta: maxHoje - prAntes, novo: maxHoje });
            totalPRs++;
          } else {
            flags.push("Aumento grande em " + (DEFAULT_EXERCISES[id] ? DEFAULT_EXERCISES[id].name : id) + " (+" + (aumentoPct * 100).toFixed(0) + "%) — confira se o peso foi digitado certo.");
          }
        }
        recordesPR[id] = maxHoje;
        maxCargaGeral = Math.max(maxCargaGeral, maxHoje);
      }
    });
    if (kcalTreino > 2000) flags.push("Calorias acima de 2000 no treino — vale revisar.");
    if (data.meta && data.meta.totalVolume > 0 && volumeVidaToda > 0) {
      const mediaHistorica = volumeVidaToda / totalTreinosCompletos;
      if (mediaHistorica > 0 && data.meta.totalVolume > mediaHistorica * 2) flags.push("Volume bem acima do seu normal — vale revisar.");
    }
    narrativesByDate[date] = narratives;
    flagsByDate[date] = flags;

    exIds.forEach((id) => {
      historicoPorExercicio[id] = historicoPorExercicio[id] || [];
      historicoPorExercicio[id].push({ date, max: cargaAtualPorExercicio[id] });
    });
  });
  if (currentWeekKey !== null) flushWeek(currentWeekKey, sortedDates[sortedDates.length - 1]);

  const nivelProg = xpProgress(xpTotalFase, MAIN_CUM);
  const atributosFinal = {};
  Object.keys(atributosXP).forEach((k) => {
    const p = xpProgress(atributosXP[k], ATTR_CUM);
    atributosFinal[k] = { nivel: p.nivel, xp: Math.round(atributosXP[k]) };
  });
  const musculosFinal = {};
  GROUP_ORDER.forEach((g) => {
    const p = xpProgress(musculosXP[g], ATTR_CUM);
    musculosFinal[g] = { nivel: p.nivel, xp: Math.round(musculosXP[g]) };
  });

  const baseResult = {
    patente: rankForAscensao(ascensaoCount), nivel: nivelProg.nivel, xp: nivelProg.xpAtual, xpNecessario: nivelProg.xpNecessario,
    ascensaoCount, streakAtual: streakState.streakAtual, streakMaxima: streakState.streakMaxima,
    escudos: streakState.escudos, escudosConquistadosTotal: streakState.escudosConquistadosTotal,
    semanasPerfeitasTotal: streakState.semanasPerfeitasTotal,
    atributos: atributosFinal, musculos: musculosFinal, historicoAscensoes,
    narrativesByDate, flagsByDate, totalTreinosCompletos, totalPRs, maxCargaGeral,
    volumeRecordeSessao, volumeVidaToda, teveRessurgimento, lastWeekXPBreakdown,
  };

  const niveisMusculo = Object.values(baseResult.musculos).map((m) => m.nivel);
  const bonusEquilibrioAtivo = niveisMusculo.length > 0 && (Math.max.apply(null, niveisMusculo) - Math.min.apply(null, niveisMusculo)) <= RPG_CONFIG.EQUILIBRIO_DIFERENCA_MAX_NIVEIS;

  const conquistasDesbloqueadas = ACHIEVEMENT_DEFS.filter((a) => a.check(baseResult)).map((a) => a.id);
  const titulosDesbloqueados = TITULO_DEFS.filter((t) => t.check(baseResult)).map((t) => t.id);

  return { ...baseResult, bonusEquilibrioAtivo, conquistasDesbloqueadas, titulosDesbloqueados };
}

// Compara dois resultados do engine (antes/depois de salvar um treino) para
// decidir se o popup de level up deve aparecer. Ascensões têm sua própria
// tela (o nível geral volta a 0 nesse caso, o que não é um "level up").
export function detectLevelUps(prevEngine, newEngine) {
  if (!prevEngine || !newEngine) return null;
  if (newEngine.ascensaoCount > prevEngine.ascensaoCount) return null;
  if (newEngine.nivel <= prevEngine.nivel) return null;
  const atributos = Object.keys(newEngine.atributos || {}).filter((k) => {
    const antes = prevEngine.atributos && prevEngine.atributos[k] ? prevEngine.atributos[k].nivel : 0;
    return newEngine.atributos[k].nivel > antes;
  });
  return { de: prevEngine.nivel, para: newEngine.nivel, atributos };
}
