import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración Vite
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/models": "http://localhost:8000",
      "/history": "http://localhost:8000",
      "/predict": "http://localhost:8000",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
});


