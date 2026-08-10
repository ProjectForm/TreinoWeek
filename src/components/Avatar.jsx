import React from "react";

export function Avatar({ nivel, atributos }) {
  const estagio = nivel >= 100 ? 4 : nivel >= 76 ? 3 : nivel >= 51 ? 2 : nivel >= 26 ? 1 : 0;
  const cores = ["#52525b", "#3f3f46", "#0d9488", "#f59e0b", "#f43f5e"];
  const cor = cores[estagio];
  const dominante = Object.entries(atributos || {}).sort((a, b) => b[1].nivel - a[1].nivel)[0];
  const nomeDominante = dominante ? dominante[0] : "";
  const raio = 30 + estagio * 4;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center">
      <svg viewBox="0 0 160 140" className="w-28 h-24">
        {estagio >= 2 && <circle cx="80" cy="70" r={raio + 14} fill="none" stroke={cor} strokeOpacity="0.25" strokeWidth="3" />}
        <circle cx="80" cy="45" r="18" fill={cor} />
        <rect x="55" y="63" width="50" height="55" rx="14" fill={cor} />
        {estagio >= 1 && <rect x="45" y="70" width="12" height="35" rx="6" fill={cor} opacity="0.85" />}
        {estagio >= 1 && <rect x="103" y="70" width="12" height="35" rx="6" fill={cor} opacity="0.85" />}
        {estagio >= 3 && <circle cx="80" cy="45" r="24" fill="none" stroke={cor} strokeOpacity="0.4" strokeWidth="2" />}
      </svg>
      <p className="text-xs text-zinc-500 mt-1">Estágio {estagio + 1}/5{nomeDominante ? " · foco em " + nomeDominante : ""}</p>
    </div>
  );
}
