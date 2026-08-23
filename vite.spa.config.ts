import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  root: path.resolve("spa-entry"),
  publicDir: path.resolve("spa-entry/public"),
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    alias: {
      "@": path.resolve("src"),
    },
  },
  build: {
    outDir: path.resolve("dist-gh"),
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
