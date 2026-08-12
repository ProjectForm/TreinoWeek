import React from "react";
import { DEFAULT_MUSCLE_BREAKDOWN } from "../constants/muscleBreakdown.js";
import { DEFAULT_EXERCISES } from "../constants/exercises.js";
import { Icon } from "./Icon.jsx";

export function MuscleExercisesModal({ muscle, onClose, onSelectExercise }) {
  if (!muscle) return null;

  const exercises = Object.entries(DEFAULT_MUSCLE_BREAKDOWN)
    .map(([exId, breakdown]) => {
      const entry = breakdown.find((b) => b.m === muscle);
      return entry ? { exId, pct: entry.p } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-end animate-fadeIn" onClick={onClose}>
      <div
        className="surface-1 shadow-soft rounded-t-3xl p-5 w-full max-h-[75vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium">Exercícios para</p>
            <p className="text-lg font-bold text-zinc-100">{muscle}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="press w-9 h-9 rounded-full surface-2 flex items-center justify-center text-zinc-400">
            <Icon name="x" size={16} />
          </button>
        </div>

        {exercises.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum exercício do plano atual trabalha esse músculo diretamente.</p>
        ) : (
          <div className="space-y-1.5">
            {exercises.map(({ exId, pct }) => {
              const ex = DEFAULT_EXERCISES[exId];
              if (!ex) return null;
              return (
                <button
                  key={exId}
                  onClick={() => onSelectExercise(exId)}
                  className="press w-full flex items-center justify-between surface-2 rounded-xl px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{ex.name}</p>
                    <p className="text-xs text-zinc-500">{ex.muscle}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{pct}%</span>
                </button>
              );
            })}
          </div>
        )}
        <p className="text-[11px] text-zinc-600 mt-4 text-center">Toque num exercício para ver a evolução dele no Progresso.</p>
      </div>
    </div>
  );
}
