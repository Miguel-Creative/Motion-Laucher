import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    strategies: "generateSW",
    includeAssets: ["favicon.png", "icons/*.png", "offline.html"],
    manifest: {
      name: "Motion Laucher Remoto",
      short_name: "MRL",
      description: "Controle, teclado e touchpad do Motion Laucher",
      lang: "pt-BR",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#101014",
      theme_color: "#101014",
      icons: [
        {src:"/icons/icon-192.png", sizes:"192x192",type:"image/png"},
        {src:"/icons/icon-512.png", sizes:"512x512",type:"image/png"}
      ]
    },
    workbox: {
      navigateFallback: "/index.html",
      globPatterns: ["**/*.{js,css,html,svg,woff2,png,jpg,webp}"],
      maximumFileSizeToCacheInBytes: 3*1024*1024,
      cleanupOutdatedCaches: true,
      runtimeCaching: [],
    },
    devOptions: {enabled:false}
  })],
  resolve: { alias: { "@": fileURLToPath(new URL("../../packages/motion-ui/src/", import.meta.url)) } },
  build: { outDir: fileURLToPath(new URL("../../dist/mrl-pwa/", import.meta.url)), emptyOutDir: true },
  server: { port: 5174 },
  preview: { port: 4174 },
});
