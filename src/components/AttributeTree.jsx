import React from "react";

// Grade dos 4 atributos permanentes do personagem (Força, Condicionamento,
// Disciplina, Consistência). O nome "tree" reflete a intenção de progressão
// ramificada; nesta versão MVP é uma grade simples de níveis.
export function AttributeTree({ atributos }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(atributos).map(([k, v]) => (
        <div key={k} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <p className="text-xs text-zinc-500 capitalize">{k}</p>
          <p className="text-lg font-bold text-zinc-100">Nv. {v.nivel}</p>
        </div>
      ))}
    </div>
  );
}
