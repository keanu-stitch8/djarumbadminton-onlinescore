import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Static (HTML/JS/CSS only) build of the live score page. Reuses the shared UI and score logic in
// ../src; output in static/dist can be served by any web server, no Node.js needed at runtime.
export default defineConfig({
  root: here("."),
  base: "./",
  publicDir: here("../public"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": here("../src"),
      "next/image": here("./src/shims/next-image.tsx"),
      "next/link": here("./src/shims/next-link.tsx"),
    },
  },
  build: { outDir: here("dist"), emptyOutDir: true },
  server: { port: 3007, host: "0.0.0.0" },
  preview: { port: 3008, host: "0.0.0.0" },
});
