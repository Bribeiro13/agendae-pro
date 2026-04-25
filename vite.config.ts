import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

let componentTagger: (() => any) | null = null;
try {
  componentTagger = require("lovable-tagger").componentTagger;
} catch {
  // lovable-tagger não está instalado — ignorado fora do Lovable.dev
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    target: "es2020",
    // Divide o bundle em chunks menores para carregamento mais rápido
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — sempre em cache primeiro
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Query e supabase — usados em todas as páginas autenticadas
          "vendor-data": ["@tanstack/react-query", "@supabase/supabase-js"],
          // Animações — carregadas separado para não bloquear o LCP
          "vendor-motion": ["framer-motion"],
          // UI Radix — tree-shaken mas agrupado para melhor compressão
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
          ],
          // Utilitários de data — pesados, carregados separado
          "vendor-date": ["date-fns"],
        },
      },
    },
    // Reduz tamanho dos chunks sem comprometer compatibilidade
    chunkSizeWarningLimit: 600,
    // Minificação mais agressiva em produção
    minify: "esbuild",
    sourcemap: false,
  },
  // Pré-bundling melhora cold start do dev server
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@supabase/supabase-js",
      "date-fns",
      "framer-motion",
    ],
  },
}));
