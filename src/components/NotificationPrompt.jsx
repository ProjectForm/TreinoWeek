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
    <div className="bg-zinc-900 border border-amber-700 rounded-xl p-4 animate-fadeIn">
      <p className="text-sm text-amber-400 font-semibold">Ativar lembretes?</p>
      <p className="text-xs text-zinc-400 mt-1">O app pode te lembrar dos treinos e avisar quando a streak está em risco.</p>
      <div className="flex gap-2 mt-2">
        <button onClick={handleEnable} className="flex-1 bg-amber-500 text-zinc-900 text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform">
          Ativar notificações
        </button>
        <button onClick={() => setDismissed(true)} className="px-4 py-2 text-xs text-zinc-500">
          Agora não
        </button>
      </div>
    </div>
  );
}
