import React, { useState } from "react";
import { useNotifications } from "../hooks/useNotifications.js";
import { Icon } from "./Icon.jsx";

// Card de configuração de lembrete diário — usado na aba Perfil.
export function NotificationManager() {
  const { permission, supported, askPermission, scheduleDailyReminder } = useNotifications();
  const [time, setTime] = useState("18:00");
  const [scheduled, setScheduled] = useState(false);

  if (!supported) return null;

  function handleSchedule() {
    const [h, m] = time.split(":").map(Number);
    scheduleDailyReminder(h, m);
    setScheduled(true);
    setTimeout(() => setScheduled(false), 2500);
  }

  return (
    <div className="surface-1 rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <Icon name="bell" size={16} className="text-zinc-400" />
        <p className="text-sm font-semibold text-zinc-200">Lembrete de treino</p>
      </div>

      {permission === "granted" ? (
        <>
          <p className="text-xs text-zinc-500 mt-1.5">Escolha o horário e agende o lembrete de hoje.</p>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="surface-2 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none"
            />
            <button onClick={handleSchedule} className="press flex-1 bg-rose-500 text-white text-xs font-semibold py-2.5 rounded-lg">
              {scheduled ? "Agendado ✓" : "Agendar para hoje"}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">Funciona enquanto o app estiver aberto ou recém-usado.</p>
        </>
      ) : (
        <>
          <p className="text-xs text-zinc-500 mt-1.5">Ative para receber um lembrete do treino do dia.</p>
          <button onClick={askPermission} className="press w-full bg-rose-500 text-white text-xs font-semibold py-2.5 rounded-lg mt-3">
            Ativar notificações
          </button>
        </>
      )}
    </div>
  );
}
