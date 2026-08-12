import { describe, it, expect, beforeEach } from "vitest";

// Ambiente de teste roda em 'node' (sem DOM), então localStorage não existe
// globalmente — instala um polyfill mínimo em memória, suficiente pra testar
// o contrato de useStorage.js (que só chama getItem/setItem/removeItem/key/length).
function installFakeLocalStorage() {
  let store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
    clear: () => store.clear(),
  };
  return () => store.clear();
}

let clearStore;
beforeEach(async () => {
  clearStore = installFakeLocalStorage();
  clearStore();
});

const { sList, sGet, sSet, sDelete } = await import("./useStorage.js");

describe("sSet / sGet (identidade escrita->leitura)", () => {
  it("o valor lido de volta é idêntico ao que foi escrito", async () => {
    await sSet("day:2026-08-10", JSON.stringify({ status: "completed" }));
    const raw = await sGet("day:2026-08-10");
    expect(JSON.parse(raw)).toEqual({ status: "completed" });
  });

  it("chave inexistente retorna null, não lança erro", async () => {
    expect(await sGet("chave-que-nunca-existiu")).toBeNull();
  });

  it("sobrescrever uma chave existente atualiza o valor lido", async () => {
    await sSet("settings", JSON.stringify({ weight: 80 }));
    await sSet("settings", JSON.stringify({ weight: 82 }));
    expect(JSON.parse(await sGet("settings"))).toEqual({ weight: 82 });
  });
});

describe("sDelete", () => {
  it("remove a chave; leitura subsequente retorna null", async () => {
    await sSet("temp", "1");
    await sDelete("temp");
    expect(await sGet("temp")).toBeNull();
  });
  it("deletar uma chave inexistente não lança erro", async () => {
    await expect(sDelete("nunca-existiu")).resolves.toBe(true);
  });
});

describe("sList (usado para carregar todos os day:/week: salvos)", () => {
  it("retorna só as chaves que começam com o prefixo pedido", async () => {
    await sSet("day:2026-08-10", "{}");
    await sSet("day:2026-08-11", "{}");
    await sSet("week:2026-W33", "{}");
    await sSet("settings", "{}");
    const dayKeys = (await sList("day:")).sort();
    expect(dayKeys).toEqual(["day:2026-08-10", "day:2026-08-11"]);
  });
  it("prefixo sem nenhuma correspondência retorna lista vazia", async () => {
    expect(await sList("nao-existe:")).toEqual([]);
  });
});

describe("resiliência a falhas de storage", () => {
  it("sGet não lança mesmo se localStorage.getItem lançar (ex.: contexto privado/bloqueado)", async () => {
    globalThis.localStorage.getItem = () => { throw new Error("blocked"); };
    expect(await sGet("qualquer")).toBeNull();
  });
  it("sSet propaga uma falha de escrita como erro claro (ex.: quota excedida), em vez de falhar silenciosamente", async () => {
    globalThis.localStorage.setItem = () => { throw new Error("QuotaExceededError"); };
    await expect(sSet("x", "1")).rejects.toThrow(/falha ao salvar/);
  });
  it("sList não lança mesmo se localStorage estiver inacessível", async () => {
    globalThis.localStorage = null;
    expect(await sList("day:")).toEqual([]);
  });
});
