import React from "react";

const CORES = {
  forca: "#f43f5e",
  condicionamento: "#f59e0b",
  disciplina: "#3b82f6",
  consistencia: "#10b981",
};

// Silhueta minimalista (sem rosto, só formas geométricas) que fica mais
// "musculosa" conforme o estágio sobe, e muda de cor conforme o atributo
// dominante do personagem.
export function MinimalAvatar({ nivel, atributos }) {
  const estagio = nivel >= 100 ? 5 : nivel >= 75 ? 4 : nivel >= 50 ? 3 : nivel >= 25 ? 2 : 1;
  const dominante = Object.entries(atributos || {}).sort((a, b) => (b[1]?.nivel || 0) - (a[1]?.nivel || 0))[0];
  const atributoDominante = dominante ? dominante[0] : "consistencia";
  const cor = CORES[atributoDominante] || "#71717a";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center">
      <svg viewBox="0 0 100 140" className="w-24 h-32">
        <circle cx="50" cy="20" r="12" fill={cor} opacity={0.9} />
        <rect x={50 - (8 + estagio * 2)} y="35" width={16 + estagio * 4} height="45" rx="6" fill={cor} opacity={0.85} />
        <rect x="15" y="38" width="12" height={30 + estagio * 3} rx="6" fill={cor} opacity={0.7} transform="rotate(10 21 53)" />
        <rect x="73" y="38" width="12" height={30 + estagio * 3} rx="6" fill={cor} opacity={0.7} transform="rotate(-10 79 53)" />
        <rect x="32" y="78" width="14" height="50" rx="7" fill={cor} opacity={0.75} />
        <rect x="54" y="78" width="14" height="50" rx="7" fill={cor} opacity={0.75} />
        {estagio >= 4 && <circle cx="50" cy="70" r="45" fill="none" stroke={cor} strokeWidth="1" opacity="0.3" />}
      </svg>
      <p className="text-xs text-zinc-500 mt-1">Estágio {estagio}/5</p>
      <p className="text-xs text-zinc-600 capitalize">Foco: {atributoDominante}</p>
    </div>
  );
}
