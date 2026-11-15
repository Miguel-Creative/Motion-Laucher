import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("../../packages/motion-ui/src/", import.meta.url)) } },
  build: { outDir: fileURLToPath(new URL("../../dist/tv-preview/", import.meta.url)), emptyOutDir: true, target: "chrome83" },
  server: { port: 5173 },
  preview: { port: 4173 },
});
