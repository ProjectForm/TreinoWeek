import { describe, it, expect } from "vitest";
import { buildExportPayload, parseBackupInput, isImportedDayNewer, BACKUP_SCHEMA_VERSION } from "./backup.js";

describe("buildExportPayload", () => {
  it("envolve os dados com metadata de versão/data de exportação", () => {
    const payload = buildExportPayload({ "day:2026-08-10": "{}" });
    expect(payload.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(typeof payload.appVersion).toBe("string");
    expect(typeof payload.exportedAt).toBe("string");
    expect(payload.data).toEqual({ "day:2026-08-10": "{}" });
  });
});

describe("parseBackupInput", () => {
  it("JSON inválido é rejeitado (retorna null, não lança)", () => {
    expect(parseBackupInput("{not valid json")).toBeNull();
  });
  it("estrutura raiz que não é objeto é rejeitada", () => {
    expect(parseBackupInput("42")).toBeNull();
    expect(parseBackupInput("[1,2,3]")).toBeNull();
    expect(parseBackupInput("null")).toBeNull();
  });
  it("reconhece e extrai o formato novo (com schemaVersion + data)", () => {
    const raw = JSON.stringify({ schemaVersion: 1, appVersion: "1.0.0", exportedAt: "2026-01-01T00:00:00Z", data: { settings: "{}" } });
    const r = parseBackupInput(raw);
    expect(r.schemaVersion).toBe(1);
    expect(r.data).toEqual({ settings: "{}" });
  });
  it("compatível com backup antigo: mapa cru de chave->valor, sem wrapper nenhum", () => {
    const raw = JSON.stringify({ "day:2026-08-10": "{}", settings: "{}" });
    const r = parseBackupInput(raw);
    expect(r.schemaVersion).toBeNull();
    expect(r.data).toEqual({ "day:2026-08-10": "{}", settings: "{}" });
  });
  it("estrutura incompleta (schemaVersion presente mas 'data' ausente ou inválido) é tratada como formato legado, não rejeitada às cegas", () => {
    const raw = JSON.stringify({ schemaVersion: 1, foo: "bar" });
    const r = parseBackupInput(raw);
    // Sem 'data' válido, cai no fallback de tratar o objeto inteiro como o mapa de dados.
    expect(r.data).toEqual({ schemaVersion: 1, foo: "bar" });
  });
});

describe("isImportedDayNewer", () => {
  it("dado importado mais recente substitui o existente", () => {
    const existing = JSON.stringify({ completedAt: "2026-08-01T10:00:00.000Z" });
    const imported = JSON.stringify({ completedAt: "2026-08-05T10:00:00.000Z" });
    expect(isImportedDayNewer(existing, imported)).toBe(true);
  });
  it("dado importado mais antigo não substitui o existente", () => {
    const existing = JSON.stringify({ completedAt: "2026-08-05T10:00:00.000Z" });
    const imported = JSON.stringify({ completedAt: "2026-08-01T10:00:00.000Z" });
    expect(isImportedDayNewer(existing, imported)).toBe(false);
  });
  it("mesma data conta como 'mais recente ou igual' e substitui (idempotência de reimportação)", () => {
    const same = JSON.stringify({ completedAt: "2026-08-05T10:00:00.000Z" });
    expect(isImportedDayNewer(same, same)).toBe(true);
  });
  it("JSON existente corrompido: falha seguro, não substitui (evita sobrescrever um registro legível com lixo)", () => {
    const existing = "{not valid json";
    const imported = JSON.stringify({ completedAt: "2026-08-05T10:00:00.000Z" });
    expect(isImportedDayNewer(existing, imported)).toBe(false); // falha seguro: não substitui
  });
  it("registro sem completedAt é tratado como o mais antigo possível", () => {
    const existing = JSON.stringify({});
    const imported = JSON.stringify({ completedAt: "2026-08-05T10:00:00.000Z" });
    expect(isImportedDayNewer(existing, imported)).toBe(true);
  });
});
