// Lógica pura de export/import de backup — sem I/O, sem localStorage, sem
// React. Isolada aqui pra ser testável e pra doExport/doImport (em
// useWorkoutData.js) ficarem só orquestração.
//
// A partir desta versão, o export passa a ter metadata (schemaVersion,
// appVersion, exportedAt) envolvendo o mapa de dados de sempre. Isso NÃO é
// uma migração de storage — é só uma preparação pra detectar formato/versão
// em uma futura migração, sem quebrar backups antigos (que eram só o mapa
// cru, sem wrapper).

export const BACKUP_SCHEMA_VERSION = 1;
export const APP_VERSION = "1.0.0"; // acompanha a version de package.json

export function buildExportPayload(data) {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

// Aceita tanto o formato novo ({schemaVersion, appVersion, exportedAt, data})
// quanto um backup antigo (mapa cru chave->valor, sem wrapper nenhum).
// Retorna null pra qualquer entrada que não seja um objeto de dados válido.
export function parseBackupInput(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const looksVersioned =
    typeof parsed.schemaVersion !== "undefined" &&
    parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data);
  const data = looksVersioned ? parsed.data : parsed;

  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  return { schemaVersion: looksVersioned ? parsed.schemaVersion : null, data };
}

// Decide se um registro de dia importado deve substituir o existente,
// comparando completedAt. Dado ilegível (JSON inválido de um dos dois lados)
// nunca substitui o existente — falha "seguro", preservando o que já estava
// salvo em vez de arriscar sobrescrever com lixo.
export function isImportedDayNewer(existingRaw, importedRaw) {
  try {
    const existingParsed = JSON.parse(existingRaw);
    const importedParsed = JSON.parse(importedRaw);
    const existingDate = new Date(existingParsed.completedAt || "1970-01-01");
    const importedDate = new Date(importedParsed.completedAt || "1970-01-01");
    return importedDate >= existingDate;
  } catch (e) {
    return false;
  }
}
