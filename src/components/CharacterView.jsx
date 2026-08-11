import React from "react";
import { GROUP_ORDER } from "../constants/muscleBreakdown.js";
import { ACHIEVEMENT_DEFS, TITULO_DEFS } from "../constants/achievements.js";
import { MinimalAvatar } from "./MinimalAvatar.jsx";
import { AttributeTree } from "./AttributeTree.jsx";
import { Icon } from "./Icon.jsx";

export function CharacterView({ plan, logs, weeks, date, gamification }) {
  const { engineResult, tituloAtivo, pickTitulo } = gamification;
  const treinados = Object.values(engineResult.musculos).filter((v) => v.xp > 0).length;

  return (
    <div className="px-4 pt-4 pb-4 space-y-3">
      {/* Nível 1 — identidade do personagem */}
      <div className="surface-1 shadow-soft rounded-2xl p-5">
        <MinimalAvatar nivel={engineResult.nivel} atributos={engineResult.atributos} />

        <div className="text-center mt-4">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium">{engineResult.patente}</p>
          <p className="text-3xl font-bold text-zinc-50 mt-0.5">LV. {engineResult.nivel}</p>
          {tituloAtivo && TITULO_DEFS.find((t) => t.id === tituloAtivo) && (
            <p className="text-xs text-amber-400 mt-1">"{TITULO_DEFS.find((t) => t.id === tituloAtivo).nome}"</p>
          )}
        </div>

        <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-4">
          <div
            className="bg-rose-400 h-1.5 rounded-full"
            style={{ width: (engineResult.xpNecessario ? Math.min(100, (engineResult.xp / engineResult.xpNecessario) * 100) : 100) + "%" }}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1.5 text-center">
          {engineResult.xp} / {engineResult.xpNecessario} XP · ascensão em {100 - engineResult.nivel} níveis
        </p>

        <div className="grid grid-cols-3 mt-4 pt-4 border-t divider">
          <div className="text-center">
            <p className="text-lg font-bold text-teal-400 tabular-nums">{engineResult.streakAtual}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">semanas streak</p>
          </div>
          <div className="text-center border-x divider">
            <p className="text-lg font-bold text-zinc-100 tabular-nums flex items-center justify-center gap-1">
              <Icon name="shield" size={13} className="text-sky-400" filled />
              {engineResult.escudos}/2
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">escudos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-100 tabular-nums">{engineResult.semanasPerfeitasTotal}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">semanas perfeitas</p>
          </div>
        </div>
      </div>

      {/* Nível 2 — atributos */}
      <div>
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2 px-1">Atributos</p>
        <AttributeTree atributos={engineResult.atributos} />
      </div>

      {/* Nível 2 — grupos musculares + desafio de equilíbrio agrupados */}
      <div className="surface-1 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium">Grupos musculares</p>
          {engineResult.bonusEquilibrioAtivo && <p className="text-[11px] text-teal-400 font-medium">+10% equilíbrio</p>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {GROUP_ORDER.map((k) => (
            <div key={k} className="surface-2 rounded-xl p-2 text-center">
              <p className="text-[11px] text-zinc-500 truncate">{k}</p>
              <p className="text-sm font-bold text-zinc-100">Nv. {engineResult.musculos[k].nivel}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t divider">
          <p className="text-xs text-zinc-400">Treine os 6 grupos ao menos uma vez</p>
          <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-2">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: (treinados / GROUP_ORDER.length) * 100 + "%" }} />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">{treinados}/{GROUP_ORDER.length} grupos com XP</p>
        </div>
      </div>

      {/* Nível 2 — conquistas, uma superfície com linhas em vez de card-por-item */}
      <div className="surface-1 rounded-2xl overflow-hidden">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium px-4 pt-4 pb-2">
          Conquistas ({engineResult.conquistasDesbloqueadas.length}/{ACHIEVEMENT_DEFS.length})
        </p>
        <div>
          {ACHIEVEMENT_DEFS.map((a) => {
            const unlocked = engineResult.conquistasDesbloqueadas.indexOf(a.id) !== -1;
            return (
              <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5 border-t divider first:border-t-0">
                <div className="min-w-0">
                  <p className={"text-sm font-medium truncate " + (unlocked ? "text-zinc-100" : "text-zinc-500")}>{a.nome}</p>
                  <p className="text-xs text-zinc-500 truncate">{a.desc}</p>
                </div>
                {unlocked ? (
                  <Icon name="checkCircle" size={18} className="text-teal-400 shrink-0" />
                ) : (
                  <span className="w-[18px] h-[18px] rounded-full border-2 border-zinc-700 shrink-0" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {engineResult.titulosDesbloqueados.length > 0 && (
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2 px-1">Títulos desbloqueados</p>
          <div className="flex flex-wrap gap-2">
            {engineResult.titulosDesbloqueados.map((id) => {
              const t = TITULO_DEFS.find((x) => x.id === id);
              const active = tituloAtivo === id;
              return (
                <button
                  key={id}
                  onClick={() => pickTitulo(id)}
                  className={"press px-3.5 py-2 rounded-xl text-xs font-semibold " + (active ? "bg-amber-400 text-zinc-900" : "surface-2 text-zinc-300")}
                >
                  {t.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {engineResult.historicoAscensoes.length > 0 && (
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mb-2 px-1">Histórico de ascensões</p>
          <div className="surface-1 rounded-2xl overflow-hidden">
            {engineResult.historicoAscensoes.slice().reverse().map((a, i) => (
              <div key={a.numero} className={"px-4 py-3 " + (i > 0 ? "border-t divider" : "")}>
                <p className="text-sm text-zinc-100">{a.de} → {a.para}</p>
                <p className="text-xs text-zinc-500">Streak máxima na fase: {a.streakMaxima}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
