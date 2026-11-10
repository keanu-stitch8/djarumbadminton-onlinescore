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
    // Order matters: the specific "@/lib/base-path" swap must come before the generic "@" alias.
    alias: [
      { find: "@/lib/base-path", replacement: here("./src/shims/base-path.ts") },
      { find: "@", replacement: here("../src") },
      { find: "next/image", replacement: here("./src/shims/next-image.tsx") },
      { find: "next/link", replacement: here("./src/shims/next-link.tsx") },
    ],
  },
  build: { outDir: here("dist"), emptyOutDir: true },
  server: { port: 3007, host: "0.0.0.0" },
  preview: { port: 3008, host: "0.0.0.0" },
});
