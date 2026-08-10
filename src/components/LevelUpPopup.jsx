import React, { useEffect } from "react";

// Popup não-bloqueante de level up. Recebe o evento já calculado por
// detectLevelUps (utils/xp.js) — não decide sozinho quando disparar.
export function LevelUpPopup({ event, onClose }) {
  useEffect(() => {
    if (!event) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-6 pointer-events-none">
      <div
        onClick={onClose}
        className="pointer-events-auto bg-zinc-900 border border-rose-500/50 rounded-2xl px-6 py-5 shadow-2xl text-center animate-scaleIn max-w-xs w-full"
      >
        <p className="text-xs text-rose-400 uppercase tracking-widest font-semibold">Level Up</p>
        <p className="text-4xl font-bold text-zinc-100 mt-1">Nv. {event.para}</p>
        {event.atributos.length > 0 && (
          <p className="text-xs text-teal-400 mt-2 capitalize">{event.atributos.join(", ")} subiu de nível</p>
        )}
      </div>
    </div>
  );
}
