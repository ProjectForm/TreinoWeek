import { useState, useEffect } from "react";
import { isSupported, getPermission, requestPermission, scheduleReminder } from "../utils/notifications.js";

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

  return { permission, supported, askPermission, scheduleDailyReminder };
}
