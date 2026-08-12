import React from "react";
import { Icon } from "../Icon.jsx";
import { Button } from "./Button.jsx";

// Estado vazio padrão — ícone decorativo + título + descrição + ação
// opcional. Generaliza as mensagens "nenhum treino ainda" espalhadas hoje
// como texto solto em cada tela.
export function EmptyState({ icon, title, description, actionLabel, onAction, className = "" }) {
  return (
    <div className={"flex flex-col items-center text-center py-12 px-6 " + className}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4" aria-hidden="true">
          <Icon name={icon} size={22} className="text-ink-tertiary" />
        </div>
      )}
      <p className="text-body font-semibold text-ink-primary">{title}</p>
      {description && <p className="text-body-sm text-ink-secondary mt-1.5 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
