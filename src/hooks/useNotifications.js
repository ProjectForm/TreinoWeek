import { useState, useEffect, useCallback } from "react";
import { isSupported, getPermission, requestPermission, scheduleReminder, sendNotification } from "../utils/notifications.js";

const WEEKDAY_NUM = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };

export function useNotifications() {
  const [permission, setPermission] = useState("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSupported());
    setPermission(getPermission());
  }, []);

  async function askPermission() {
    const result = await requestPermission();
    setPermission(result);
    return result;
  }

  function scheduleDailyReminder(hour, minute) {
    return scheduleReminder(hour, minute, "Hora do treino", "Não esqueça do treino de hoje.");
  }

  // Agenda um lembrete às 18h pra cada dia de treino planejado (próxima
  // ocorrência de cada dia da semana). Mesma limitação do scheduleReminder:
  // só dispara enquanto o app estiver aberto/recém-usado.
  const scheduleWorkoutReminders = useCallback((plan) => {
    if (!plan || getPermission() !== "granted") return [];
    const timeouts = [];
    Object.keys(plan)
      .filter((k) => plan[k] && plan[k].items && plan[k].items.length > 0)
      .forEach((dayKey) => {
        const targetDay = WEEKDAY_NUM[dayKey];
        if (targetDay === undefined) return;
        const now = new Date();
        const target = new Date(now);
        target.setDate(now.getDate() + ((targetDay - now.getDay() + 7) % 7));
        target.setHours(18, 0, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 7);
        const delay = target.getTime() - now.getTime();
        timeouts.push(setTimeout(() => sendNotification("Hora de treinar! 💪", `Hoje é dia de ${plan[dayKey].muscle}. Não quebre sua streak!`), delay));
      });
    return timeouts;
  }, []);

  return { permission, supported, askPermission, scheduleDailyReminder, scheduleWorkoutReminders };
}
