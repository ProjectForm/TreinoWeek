import { useState, useEffect, useMemo, useRef } from "react";
import { sGet, sSet } from "./useStorage.js";
import { computePlayerStateEngine, multiplicadorStreak, detectLevelUps } from "../utils/xp.js";

// Todo o estado do personagem é derivado dos treinos (logs/weeks) — nunca lido
// de storage. Só o título escolhido e o "último nível de ascensão visto" (pra
// saber se deve mostrar a tela de ascensão) são persistidos.
export function useGamification(logs, weeks, ready) {
  const [tituloAtivo, setTituloAtivo] = useState(null);
  const [lastSeenAscensao, setLastSeenAscensao] = useState(0);
  const [showAscensao, setShowAscensao] = useState(false);
  const [gamificationReady, setGamificationReady] = useState(false);
  const [levelUpEvent, setLevelUpEvent] = useState(null);
  const prevEngineRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const tituloRaw = await sGet("tituloAtivo");
      const lastSeenRaw = await sGet("lastSeenAscensao");
      if (alive) {
        setTituloAtivo(tituloRaw || null);
        setLastSeenAscensao(lastSeenRaw ? parseInt(lastSeenRaw, 10) : 0);
        setGamificationReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const engineResult = useMemo(() => computePlayerStateEngine(logs, weeks), [logs, weeks]);

  useEffect(() => {
    if (!ready) return;
    if (engineResult.ascensaoCount > lastSeenAscensao) setShowAscensao(true);
  }, [ready, engineResult.ascensaoCount, lastSeenAscensao]);

  // Compara com o resultado anterior do engine pra detectar level up (não
  // dispara na primeira carga — só quando um novo treino muda o resultado).
  useEffect(() => {
    if (!ready) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevEngineRef.current = engineResult;
      return;
    }
    const event = detectLevelUps(prevEngineRef.current, engineResult);
    if (event) setLevelUpEvent(event);
    prevEngineRef.current = engineResult;
  }, [ready, engineResult]);

  function clearLevelUpEvent() {
    setLevelUpEvent(null);
  }

  async function acknowledgeAscensao() {
    setShowAscensao(false);
    setLastSeenAscensao(engineResult.ascensaoCount);
    try { await sSet("lastSeenAscensao", String(engineResult.ascensaoCount)); } catch (e) { /* falha ao persistir: estado em memória já foi atualizado, tenta de novo na próxima ascensão */ }
  }

  async function pickTitulo(id) {
    setTituloAtivo(id);
    try { await sSet("tituloAtivo", id); } catch (e) { /* falha ao persistir: estado em memória já foi atualizado */ }
  }

  return {
    engineResult, tituloAtivo, pickTitulo,
    showAscensao, setShowAscensao, acknowledgeAscensao,
    gamificationReady, multiplicadorStreak,
    levelUpEvent, clearLevelUpEvent,
  };
}
