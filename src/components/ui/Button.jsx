import React from "react";

const VARIANTS = {
  primary: "bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700",
  secondary: "bg-surface-2 text-ink-primary border border-line-default hover:bg-surface-3",
  ghost: "bg-transparent text-ink-primary hover:bg-surface",
};

const SIZES = {
  default: "h-12 px-[18px] text-[15px]", // 48px
  large: "h-14 px-6 text-base", // 56px
};

// Botão base do design system (Fase 2A-1). Generaliza o padrão repetido nas
// telas atuais (bg-rose-500 px-5 py-3 rounded-xl ...) sem substituí-lo ainda
// — telas continuam com seus próprios botões até a fase de redesign.
export function Button({ variant = "primary", size = "default", disabled = false, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold " +
        "transition-[background-color,transform,opacity] duration-standard ease-out " +
        "active:scale-[0.98] active:duration-micro " +
        "disabled:opacity-50 disabled:pointer-events-none " +
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 " +
        VARIANTS[variant] + " " + SIZES[size] + " " + className
      }
      {...rest}
    >
      {children}
    </button>
  );
}
