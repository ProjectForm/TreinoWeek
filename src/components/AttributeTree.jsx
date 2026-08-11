import React from "react";
import { Icon } from "./Icon.jsx";

const NODES = [
  { id: "forca", label: "Força", icon: "dumbbell", x: 50, y: 15 },
  { id: "condicionamento", label: "Condicionamento", icon: "flame", x: 15, y: 50 },
  { id: "disciplina", label: "Disciplina", icon: "target", x: 85, y: 50 },
  { id: "consistencia", label: "Consistência", icon: "chart", x: 50, y: 85 },
];

const CONNECTIONS = [
  ["forca", "condicionamento"],
  ["forca", "disciplina"],
  ["condicionamento", "consistencia"],
  ["disciplina", "consistencia"],
];

// Grade dos 4 atributos permanentes do personagem, desenhada como uma árvore
// (nós ligados por linhas) pra deixar visível que eles se reforçam entre si.
export function AttributeTree({ atributos }) {
  const nodes = NODES.map((n) => ({
    ...n,
    nivel: (atributos && atributos[n.id] && atributos[n.id].nivel) || 0,
  }));

  return (
    <div className="surface-1 rounded-2xl p-4">
      <div className="relative h-48 w-full">
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {CONNECTIONS.map(([fromId, toId], i) => {
            const from = nodes.find((n) => n.id === fromId);
            const to = nodes.find((n) => n.id === toId);
            return (
              <line
                key={i}
                x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`}
                stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4"
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 2 }}
          >
            <div
              className={
                "w-14 h-14 rounded-full flex items-center justify-center border-2 " +
                (node.nivel >= 50 ? "border-amber-500 bg-amber-950 text-amber-400" : node.nivel >= 25 ? "border-teal-500 bg-teal-950 text-teal-400" : "border-zinc-700 bg-zinc-950 text-zinc-400")
              }
            >
              <Icon name={node.icon} size={20} />
            </div>
            <p className="text-xs text-zinc-400 mt-1 whitespace-nowrap">{node.label}</p>
            <p className="text-xs font-bold text-zinc-200">Nv. {node.nivel}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 mt-2 text-center">Atributos se fortalecem entre si. Consistência é a raiz de tudo.</p>
    </div>
  );
}
