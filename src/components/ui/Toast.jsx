import React from "react";

const VARIANTS = {
  neutral: "border-line-default",
  success: "border-primary-600/50",
  error: "border-rose-500/50",
};

// Mensagem transitória flutuante — controlada pelo pai (mostra/esconde),
// generaliza o padrão de "msg"/"importMsg"/"profileMsg" hoje renderizado
// como <p> solto em vários componentes (WorkoutForm, ProfileView, ...).
export function Toast({ open, variant = "neutral", children }) {
  if (!open) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "fixed left-1/2 -translate-x-1/2 z-toast bottom-24 max-w-[90vw] " +
        "bg-surface-3/95 backdrop-blur-[var(--blur-md)] border rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] " +
        "px-4 py-2.5 text-body-sm text-ink-primary animate-fadeIn " + VARIANTS[variant]
      }
    >
      {children}
    </div>
  );
}
