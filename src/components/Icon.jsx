import React from "react";

// Conjunto pequeno e consistente de ícones lineares (traço único, cantos
// arredondados) — substitui os emojis usados como ícone principal em botões
// e navegação, mantendo uma linguagem visual única no app.
const PATHS = {
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
    </>
  ),
  dumbbell: (
    <>
      <rect x="1.5" y="9" width="3" height="6" rx="1" />
      <rect x="19.5" y="9" width="3" height="6" rx="1" />
      <rect x="5.5" y="7" width="2.5" height="10" rx="1" />
      <rect x="16" y="7" width="2.5" height="10" rx="1" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  chart: (
    <>
      <path d="M3 17.5 9 11l4 4 8-8.5" />
      <path d="M15 6.5h6v6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.5 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="15" cy="7" r="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="8" cy="12" r="2" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="14" cy="17" r="2" />
    </>
  ),
  flame: (
    <path d="M12 3c-1 3-4 4.2-4 8.2a4 4 0 0 0 8 0c0-1.6-.7-2.4-1.2-3.2.3 1.7-.4 2.6-1.3 2.6-1.2 0-1.6-1.3-1-2.4.6-1.3 1-2.8-.5-5.2Z" />
  ),
  shield: (
    <path d="M12 3.2 19 6v5c0 5-3.5 8.2-7 9.8-3.5-1.6-7-4.8-7-9.8V6l7-2.8Z" />
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.2 10.5 15 16 9" />
    </>
  ),
  chevronLeft: <path d="M15 5 8 12l7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  bell: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 14.5 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="M7.5 11 12 15.5 16.5 11" />
      <path d="M5 19.5h14" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V4" />
      <path d="M7.5 8 12 3.5 16.5 8" />
      <path d="M5 19.5h14" />
    </>
  ),
};

export function Icon({ name, size = 20, strokeWidth = 1.8, className = "", filled = false }) {
  const content = PATHS[name];
  if (!content) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
