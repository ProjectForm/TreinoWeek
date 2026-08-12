import { defineConfig } from "vitest/config";

// Config de testes separada do vite.config.js (que carrega o plugin PWA,
// desnecessário e potencialmente problemático em ambiente de teste). Os
// testes desta fase cobrem lógica de domínio pura (src/utils, src/hooks
// não-visuais), por isso o ambiente 'node' é suficiente — sem jsdom.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/utils/**", "src/hooks/**"],
    },
  },
});
