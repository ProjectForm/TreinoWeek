import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  { ignores: ["dist", "dev-dist", "node_modules"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // caughtErrors: "none" — praticamente todo catch(e) neste projeto é um
      // "ignora de propósito" documentado (dado corrompido, haptics sem
      // suporte, falha de persistência não-crítica); exigir prefixo _e em
      // ~15 blocos só pra silenciar o lint não muda comportamento nenhum.
      // React: os componentes importam `import React from "react"` mesmo
      // com o JSX runtime automático (não é mais necessário desde o React
      // 17). Sinalizar como "não usado" em ~20 arquivos e removê-los é uma
      // limpeza puramente cosmética — fora do escopo desta fase (ver
      // docs/technical-debt.md).
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^(_|React)$", caughtErrors: "none" }],
      // set-state-in-effect: regra nova (eslint-plugin-react-hooks v7) que
      // sinaliza como erro um padrão usado deliberadamente em vários hooks
      // deste projeto — sincronizar estado local a partir de uma fonte
      // externa (localStorage assíncrono, troca de data/rota, resultado do
      // engine de XP). Corrigir isso "de verdade" exigiria reestruturar
      // vários hooks (useWorkoutData, useGamification, useNotifications,
      // WorkoutForm, ProgressView) nesta fase — o tipo de refatoração grande
      // que a Fase 1 explicitamente pede pra não fazer sem necessidade
      // comprovada de bug. Rebaixado pra warning; ver docs/technical-debt.md.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["**/*.test.js"],
    languageOptions: { globals: { ...globals.node } },
  },
];
