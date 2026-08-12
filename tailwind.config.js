/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: "#09090b",
          900: "#18181b",
          800: "#27272a",
        },
        // ---- Fase 2A-1: novos tokens de design ----
        // Namespaces novos (primary/canvas/surface/line/ink) — nenhum colide
        // com zinc/rose/teal/amber já usados nas telas atuais, então nada
        // muda visualmente até esses tokens serem adotados tela por tela em
        // uma fase futura. "line"/"canvas" (em vez de "border"/"bg") evitam
        // o utilitário Tailwind duplicar o prefixo (ex.: "border-border-x").
        primary: {
          50: "#F0FDFA", 100: "#CCFBF1", 200: "#99F6E4", 300: "#5EEAD4", 400: "#2DD4BF",
          500: "#14B8A6", 600: "#0F766E", 700: "#0F6B68", 800: "#115E59", 900: "#134E4A", 950: "#042F2E",
        },
        canvas: { DEFAULT: "#090A0C", 2: "#0F1114" },
        surface: { DEFAULT: "#14171B", 2: "#191D22", 3: "#1E2329", selected: "rgba(20, 184, 166, 0.10)" },
        line: { subtle: "rgba(255, 255, 255, 0.06)", default: "rgba(255, 255, 255, 0.09)", strong: "rgba(255, 255, 255, 0.14)" },
        ink: {
          primary: "rgba(255, 255, 255, 0.96)", secondary: "rgba(255, 255, 255, 0.68)",
          tertiary: "rgba(255, 255, 255, 0.48)", disabled: "rgba(255, 255, 255, 0.32)",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Text"', '"SF Pro Display"', "system-ui", "sans-serif"],
      },
      // Escala tipográfica semântica — spacing (múltiplos de 4px) não precisou
      // de token novo porque a escala padrão do Tailwind já bate exatamente
      // (1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px,
      // 12=48px, 16=64px, 20=80px).
      fontSize: {
        display: ["34px", { lineHeight: "1.1", fontWeight: "700" }],
        "large-title": ["30px", { lineHeight: "1.15", fontWeight: "700" }],
        title: ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        section: ["20px", { lineHeight: "1.25", fontWeight: "700" }],
        body: ["17px", { lineHeight: "1.45", fontWeight: "400" }],
        "body-sm": ["15px", { lineHeight: "1.4", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.35", fontWeight: "500" }],
        label: ["12px", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "0.02em" }],
        metric: ["32px", { lineHeight: "1.1", fontWeight: "700" }],
      },
      // Chaves novas (não sobrescrevem as numéricas padrão do Tailwind, que
      // não são usadas em lugar nenhum do app hoje — sem risco de colisão).
      transitionDuration: { instant: "80ms", micro: "120ms", standard: "160ms", emphasis: "220ms", modal: "240ms" },
      // Espelha os z-index já usados nas telas atuais (NavBar=30, RestTimer=40,
      // modais=50) só como vocabulário nomeado pra uso futuro — não substitui
      // os z-30/z-40/z-50 já escritos nos componentes existentes.
      zIndex: { nav: "30", floating: "40", overlay: "50", toast: "60", tooltip: "70" },
    },
  },
  plugins: [],
};
