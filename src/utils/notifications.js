// Wrapper simples sobre a API de Notification do navegador. Usado pelo
// NotificationManager para lembrar o usuário do treino do dia — funcionalidade
// nova (não existia no artifact original), pensada pra fazer sentido num PWA
// instalado no celular.

export function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission() {
  if (!isSupported()) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

export async function requestPermission() {
  if (!isSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return "denied";
  }
}

export function sendNotification(title, body) {
  if (!isSupported() || Notification.permission !== "granted") return false;
  try {
    new Notification(title, { body, icon: "/icons/icon-192.png" });
    return true;
  } catch (e) {
    return false;
  }
}

// Agenda um lembrete simples usando setTimeout — funciona enquanto o app
// estiver aberto ou em segundo plano recente. Para lembretes confiáveis com o
// app fechado seria necessário um service worker com Push API + um servidor,
// o que está fora do escopo deste MVP.
export function scheduleReminder(hour, minute, title, body) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const ms = target.getTime() - now.getTime();
  return setTimeout(() => sendNotification(title, body), ms);
}
