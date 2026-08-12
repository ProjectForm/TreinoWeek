// Wrapper de armazenamento local. No artifact original isso usava window.storage
// (específico do ambiente Claude); aqui usa localStorage do navegador, que é
// síncrono por natureza — as funções continuam async pra manter a mesma
// interface que o resto do app já espera (chamadas com await).

export async function sList(prefix) {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    return keys;
  } catch (e) {
    return [];
  }
}

export async function sGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export async function sSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return { key, value };
  } catch (e) {
    throw new Error("falha ao salvar no localStorage: " + e.message, { cause: e });
  }
}

export async function sDelete(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}
