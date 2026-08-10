import { useState, useEffect, useMemo } from "react";
import { sGet, sSet } from "./useStorage.js";
import { computePlayerStateEngine, multiplicadorStreak } from "../utils/xp.js";

// Todo o estado do personagem é derivado dos treinos (logs/weeks) — nunca lido
// de storage. Só o título escolhido e o "último nível de ascensão visto" (pra
// saber se deve mostrar a tela de ascensão) são persistidos.
export function useGamification(logs, weeks, ready) {
  const [tituloAtivo, setTituloAtivo] = useState(null);
  const [lastSeenAscensao, setLastSeenAscensao] = useState(0);
  const [showAscensao, setShowAscensao] = useState(false);
  const [gamificationReady, setGamificationReady] = useState(false);

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

  async function acknowledgeAscensao() {
    setShowAscensao(false);
    setLastSeenAscensao(engineResult.ascensaoCount);
    try { await sSet("lastSeenAscensao", String(engineResult.ascensaoCount)); } catch (e) {}
  }

  async function pickTitulo(id) {
    setTituloAtivo(id);
    try { await sSet("tituloAtivo", id); } catch (e) {}
  }

  return {
    engineResult, tituloAtivo, pickTitulo,
    showAscensao, setShowAscensao, acknowledgeAscensao,
    gamificationReady, multiplicadorStreak,
  };
}
