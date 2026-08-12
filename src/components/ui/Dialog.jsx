import React, { useEffect } from "react";

// Modal centralizado — generaliza o padrão já usado em AscensaoModal
// (overlay + painel animado + role=dialog). closeOnBackdrop=false pra casos
// como ascensão, onde o fechamento deve ser só pelo botão de ação.
export function Dialog({ open, onClose, label, closeOnBackdrop = true, className = "", children }) {
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
    <div
      className="fixed inset-0 z-overlay bg-canvas/85 backdrop-blur-[var(--blur-sm)] flex items-center justify-center p-6 animate-fadeIn"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={
          "surface-1 border border-line-default shadow-[var(--shadow-xl)] rounded-[var(--radius-xl)] p-6 w-full max-w-xs animate-scaleIn " + className
        }
      >
        {children}
      </div>
    </div>
  );
}
