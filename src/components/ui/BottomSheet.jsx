import React, { useEffect } from "react";

// Sheet ancorada embaixo — generaliza o padrão já usado em
// MuscleExercisesModal (overlay + painel deslizando de baixo, cantos
// arredondados só em cima).
export function BottomSheet({ open, onClose, label, className = "", children }) {
  useEffect(() => {
    if (!open || !onClose) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-overlay bg-canvas/80 backdrop-blur-[var(--blur-sm)] flex items-end animate-fadeIn" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={
          "surface-1 shadow-[var(--shadow-xl)] w-full max-h-[75vh] overflow-y-auto p-5 animate-scaleIn " + className
        }
        style={{ borderTopLeftRadius: "var(--radius-2xl)", borderTopRightRadius: "var(--radius-2xl)" }}
      >
        {children}
      </div>
    </div>
  );
}
