import React from "react";

const CORES = {
  forca: "#f43f5e",
  condicionamento: "#f59e0b",
  disciplina: "#3b82f6",
  consistencia: "#10b981",
};

function shade(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// index 0 não é usado (estágio começa em 1)
const STAGE_PARAMS = [
  null,
  { shoulder: 15, waist: 12.5, bicep: 4, quad: 4.5, abLines: 0 },
  { shoulder: 17, waist: 12, bicep: 4.6, quad: 5, abLines: 0 },
  { shoulder: 19, waist: 11.5, bicep: 5.2, quad: 5.5, abLines: 2 },
  { shoulder: 21, waist: 11, bicep: 5.8, quad: 6, abLines: 3 },
  { shoulder: 23, waist: 10.5, bicep: 6.4, quad: 6.5, abLines: 3 },
];

// Ilustração vetorial com proporções humanas, sombreado em gradiente,
// brilho de definição muscular, shorts e sombra no chão. Continua sendo um
// desenho vetorial 2D — não um render 3D —, mas bem mais trabalhado.
export function MinimalAvatar({ nivel, atributos }) {
  const estagio = nivel >= 100 ? 5 : nivel >= 75 ? 4 : nivel >= 50 ? 3 : nivel >= 25 ? 2 : 1;
  const dominante = Object.entries(atributos || {}).sort((a, b) => (b[1]?.nivel || 0) - (a[1]?.nivel || 0))[0];
  const atributoDominante = dominante ? dominante[0] : "consistencia";
  const cor = CORES[atributoDominante] || "#71717a";
  const light = shade(cor, 50);
  const darkShade = shade(cor, -60);
  const p = STAGE_PARAMS[estagio];
  const gradId = "avatarGrad-" + atributoDominante;

  const cx = 60;
  const shoulderY = 46;
  const waistY = 86;
  const hipY = 92;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 172" className="w-28 h-40">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={light} />
            <stop offset="100%" stopColor={cor} />
          </linearGradient>
        </defs>

        {estagio >= 4 && (
          <circle cx={cx} cy="96" r="66" fill="none" stroke={cor} strokeWidth="1" opacity="0.22" />
        )}

        {/* sombra no chão */}
        <ellipse cx={cx} cy="166" rx="26" ry="4" fill="#000000" opacity="0.35" />

        {/* perna esquerda */}
        <g>
          <rect x={cx - p.waist * 0.62 - 6} y={hipY} width="12" height="66" rx="6" fill={`url(#${gradId})`} />
          <ellipse cx={cx - p.waist * 0.62} cy={hipY + 17} rx={5 + p.quad * 0.5} ry="11" fill={`url(#${gradId})`} />
        </g>
        {/* perna direita */}
        <g>
          <rect x={cx + p.waist * 0.62 - 6} y={hipY} width="12" height="66" rx="6" fill={`url(#${gradId})`} />
          <ellipse cx={cx + p.waist * 0.62} cy={hipY + 17} rx={5 + p.quad * 0.5} ry="11" fill={`url(#${gradId})`} />
        </g>

        {/* braço esquerdo */}
        <g transform={`rotate(9 ${cx - p.shoulder} ${shoulderY + 22})`}>
          <rect x={cx - p.shoulder - 5} y={shoulderY} width="10" height="44" rx="5" fill={`url(#${gradId})`} />
          <ellipse cx={cx - p.shoulder} cy={shoulderY + 13} rx={4.5 + p.bicep * 0.6} ry="9" fill={`url(#${gradId})`} />
        </g>
        {/* braço direito */}
        <g transform={`rotate(-9 ${cx + p.shoulder} ${shoulderY + 22})`}>
          <rect x={cx + p.shoulder - 5} y={shoulderY} width="10" height="44" rx="5" fill={`url(#${gradId})`} />
          <ellipse cx={cx + p.shoulder} cy={shoulderY + 13} rx={4.5 + p.bicep * 0.6} ry="9" fill={`url(#${gradId})`} />
        </g>

        {/* torso (silhueta em V, ombros largos e cintura estreita) */}
        <path
          d={`M ${cx - p.shoulder} ${shoulderY}
              Q ${cx - p.shoulder - 2} ${(shoulderY + waistY) / 2} ${cx - p.waist} ${waistY}
              L ${cx - p.waist} ${hipY}
              Q ${cx} ${hipY + 8} ${cx + p.waist} ${hipY}
              L ${cx + p.waist} ${waistY}
              Q ${cx + p.shoulder + 2} ${(shoulderY + waistY) / 2} ${cx + p.shoulder} ${shoulderY}
              Q ${cx} ${shoulderY - 9} ${cx - p.shoulder} ${shoulderY}
              Z`}
          fill={`url(#${gradId})`}
        />

        {/* brilho diagonal no torso (dá sensação de volume/definição) */}
        <path
          d={`M ${cx - p.shoulder + 4} ${shoulderY + 3}
              L ${cx - 2} ${shoulderY + 3}
              L ${cx - p.waist * 0.35} ${waistY - 6}
              L ${cx - p.shoulder + 9} ${waistY - 12}
              Z`}
          fill="#ffffff"
          opacity="0.1"
        />

        {/* linha central do peito/abdômen */}
        {p.abLines > 0 && (
          <line x1={cx} y1={shoulderY + 12} x2={cx} y2={waistY - 4} stroke={darkShade} strokeWidth="1" opacity="0.3" />
        )}
        {/* linhas abdominais horizontais */}
        {Array.from({ length: p.abLines }).map((_, i) => (
          <path
            key={i}
            d={`M ${cx - p.waist * 0.5} ${waistY - 26 + i * 9} Q ${cx} ${waistY - 23 + i * 9} ${cx + p.waist * 0.5} ${waistY - 26 + i * 9}`}
            fill="none"
            stroke={darkShade}
            strokeWidth="1.2"
            opacity="0.32"
            strokeLinecap="round"
          />
        ))}
        {/* linha dos deltoides/peitoral */}
        <path
          d={`M ${cx - p.shoulder + 3} ${shoulderY + 4} Q ${cx} ${shoulderY + 10} ${cx + p.shoulder - 3} ${shoulderY + 4}`}
          fill="none"
          stroke={darkShade}
          strokeWidth="1"
          opacity="0.25"
        />

        {/* shorts */}
        <path
          d={`M ${cx - p.waist - 3} ${waistY - 3}
              L ${cx + p.waist + 3} ${waistY - 3}
              L ${cx + p.waist * 0.62 + 8} ${hipY + 22}
              L ${cx - p.waist * 0.62 - 8} ${hipY + 22}
              Z`}
          fill="#52525b"
        />
        <line
          x1={cx - p.waist - 2} y1={waistY - 2} x2={cx + p.waist + 2} y2={waistY - 2}
          stroke={cor} strokeWidth="1.5" opacity="0.8"
        />

        {/* pescoço */}
        <rect x={cx - 5} y="31" width="10" height="12" fill={cor} />

        {/* cabeça */}
        <circle cx={cx} cy="20" r="13" fill={`url(#${gradId})`} />
        {/* cabelo */}
        <path
          d={`M ${cx - 13} 17
              Q ${cx - 14} 4 ${cx} 5
              Q ${cx + 14} 4 ${cx + 13} 17
              Q ${cx + 10} 8 ${cx} 7.5
              Q ${cx - 10} 8 ${cx - 13} 17 Z`}
          fill="#27272a"
        />
        {/* olhos */}
        <circle cx={cx - 4.5} cy="21" r="1.3" fill="#18181b" />
        <circle cx={cx + 4.5} cy="21" r="1.3" fill="#18181b" />
      </svg>
      <p className="text-xs text-zinc-500 mt-1">Estágio {estagio}/5</p>
      <p className="text-xs text-zinc-500 capitalize">Foco: {atributoDominante}</p>
    </div>
  );
}
