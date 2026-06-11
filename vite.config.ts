import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
// http://160.34.209.27/
export default defineConfig({
  base: "/Andromeda_web/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173, // fixed port — must match VITE_OCI_REDIRECT_URI and OCI registration
    strictPort: true, // fail instead of silently switching to 5174, 5175…
    // Vite's default appType:'spa' already serves index.html for all paths,
    // so /callback is handled correctly without extra config.
    proxy: {
      '/api': {
        target: "https://140.84.181.53.nip.io",
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: "https://140.84.181.53.nip.io",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
