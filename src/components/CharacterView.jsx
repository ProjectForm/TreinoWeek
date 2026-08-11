import React from "react";
import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { ACHIEVEMENT_DEFS, TITULO_DEFS } from "../constants/achievements.js";
import { MinimalAvatar } from "./MinimalAvatar.jsx";
import { StreakBadge } from "./StreakBadge.jsx";
import { AttributeTree } from "./AttributeTree.jsx";
import { MissaoAtiva } from "./MissaoAtiva.jsx";
import { DesafioEquilibrio } from "./DesafioEquilibrio.jsx";

export function CharacterView({ plan, logs, weeks, date, gamification }) {
  const { engineResult, tituloAtivo, pickTitulo } = gamification;

  return (
    <div className="px-4 pt-4">
      <MinimalAvatar nivel={engineResult.nivel} atributos={engineResult.atributos} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center mt-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">{engineResult.patente}</p>
        <p className="text-3xl font-bold text-zinc-100 mt-1">LV. {engineResult.nivel}</p>
        <div className="w-full bg-zinc-800 rounded-full h-2 mt-3">
          <div className="bg-rose-500 h-2 rounded-full" style={{ width: (engineResult.xpNecessario ? Math.min(100, (engineResult.xp / engineResult.xpNecessario) * 100) : 100) + "%" }} />
        </div>
        <p className="text-xs text-zinc-600 mt-1">{engineResult.xp} / {engineResult.xpNecessario} XP &middot; próxima ascensão em {100 - engineResult.nivel} níveis</p>
        {tituloAtivo && TITULO_DEFS.find((t) => t.id === tituloAtivo) && (
          <p className="text-xs text-amber-400 mt-2">"{TITULO_DEFS.find((t) => t.id === tituloAtivo).nome}"</p>
        )}
      </div>

      <StreakBadge
        streakAtual={engineResult.streakAtual}
        escudos={engineResult.escudos}
        semanasPerfeitasTotal={engineResult.semanasPerfeitasTotal}
      />

      <MissaoAtiva plan={plan} logs={logs} weeks={weeks} date={date} engineResult={engineResult} />

      <p className="text-xs text-zinc-500 mt-4 mb-2">Atributos</p>
      <AttributeTree atributos={engineResult.atributos} />

      <div className="flex items-center justify-between mt-4 mb-2">
        <p className="text-xs text-zinc-500">Grupos musculares</p>
        {engineResult.bonusEquilibrioAtivo && <p className="text-xs text-teal-400">+10% bônus de equilíbrio ativo</p>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {GROUP_ORDER.map((k) => (
          <div key={k} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-center">
            <p className="text-xs text-zinc-500">{k}</p>
            <p className="text-sm font-bold text-zinc-100">Nv. {engineResult.musculos[k].nivel}</p>
          </div>
        ))}
      </div>

      <DesafioEquilibrio musculos={engineResult.musculos} />

      <p className="text-xs text-zinc-500 mt-4 mb-2">Conquistas ({engineResult.conquistasDesbloqueadas.length}/{ACHIEVEMENT_DEFS.length})</p>
      <div className="space-y-1.5">
        {ACHIEVEMENT_DEFS.map((a) => {
          const unlocked = engineResult.conquistasDesbloqueadas.indexOf(a.id) !== -1;
          return (
            <div key={a.id} className={"flex items-center justify-between rounded-lg px-3 py-2 border " + (unlocked ? "bg-zinc-900 border-zinc-800" : "bg-zinc-950 border-zinc-900")}>
              <div>
                <p className={"text-sm font-medium " + (unlocked ? "text-zinc-100" : "text-zinc-600")}>{a.nome}</p>
                <p className="text-xs text-zinc-600">{a.desc}</p>
              </div>
              <span className={"text-xs " + (unlocked ? "text-teal-400" : "text-zinc-700")}>{unlocked ? "✓" : "—"}</span>
            </div>
          );
        })}
      </div>

      {engineResult.titulosDesbloqueados.length > 0 && (
        <>
          <p className="text-xs text-zinc-500 mt-4 mb-2">Títulos desbloqueados</p>
          <div className="flex flex-wrap gap-2">
            {engineResult.titulosDesbloqueados.map((id) => {
              const t = TITULO_DEFS.find((x) => x.id === id);
              return (
                <button
                  key={id}
                  onClick={() => pickTitulo(id)}
                  className={"px-3 py-1.5 rounded-lg text-xs font-semibold border " + (tituloAtivo === id ? "bg-amber-500 text-zinc-900 border-amber-500" : "bg-zinc-900 text-zinc-300 border-zinc-800")}
                >
                  {t.nome}
                </button>
              );
            })}
          </div>
        </>
      )}

      {engineResult.historicoAscensoes.length > 0 && (
        <>
          <p className="text-xs text-zinc-500 mt-4 mb-2">Histórico de ascensões</p>
          {engineResult.historicoAscensoes.slice().reverse().map((a) => (
            <div key={a.numero} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 mb-1.5">
              <p className="text-sm text-zinc-100">{a.de} → {a.para}</p>
              <p className="text-xs text-zinc-500">Streak máxima na fase: {a.streakMaxima}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
