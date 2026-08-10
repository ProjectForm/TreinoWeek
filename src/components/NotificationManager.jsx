import React from "react";
import { useNotifications } from "../hooks/useNotifications.js";

// Card simples de configuração de lembrete diário — usado na aba Perfil.
export function NotificationManager() {
  const { permission, supported, askPermission, scheduleDailyReminder } = useNotifications();

  if (!supported) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-3">
      <p className="text-sm font-semibold text-zinc-200">Lembrete diário</p>
      {permission === "granted" ? (
        <>
          <p className="text-xs text-zinc-500 mt-1">Notificações ativadas.</p>
          <button
            onClick={() => scheduleDailyReminder(18, 0)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs py-2 rounded-lg mt-2"
          >
            Agendar lembrete às 18:00 de hoje
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-zinc-500 mt-1">
            Ative para receber um lembrete do treino do dia. Funciona enquanto o app estiver aberto ou recém-usado.
          </p>
          <button onClick={askPermission} className="w-full bg-rose-500 text-white text-xs font-semibold py-2 rounded-lg mt-2">
            Ativar notificações
          </button>
        </>
      )}
    </div>
  );
}
