import React, { useState } from "react";
import { useNotifications } from "../hooks/useNotifications.js";

// Banner de ativação rápida no Dashboard. A configuração detalhada (lembrete
// diário com horário) continua na aba Perfil, via NotificationManager.
export function NotificationPrompt({ plan }) {
  const { supported, permission, askPermission, scheduleWorkoutReminders } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (!supported || permission !== "default" || dismissed) return null;

  async function handleEnable() {
    const result = await askPermission();
    if (result === "granted") scheduleWorkoutReminders(plan);
    setDismissed(true);
  }

  return (
    <div className="surface-1 rounded-2xl p-4 animate-fadeIn">
      <p className="text-sm text-zinc-100 font-semibold">Ativar lembretes?</p>
      <p className="text-xs text-zinc-500 mt-1">O app pode te lembrar dos treinos e avisar quando a streak está em risco.</p>
      <div className="flex gap-2 mt-3">
        <button onClick={handleEnable} className="press flex-1 bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg">
          Ativar notificações
        </button>
        <button onClick={() => setDismissed(true)} className="press px-4 py-2.5 text-xs text-zinc-500 font-medium">
          Agora não
        </button>
      </div>
    </div>
  );
}
