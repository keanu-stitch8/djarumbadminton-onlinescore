import type { NextConfig } from "next";
import { normalizeBasePath } from "./src/lib/base-path";

// Sub-path when served behind a reverse proxy, e.g. BASE_PATH=/mlijis-2026/venue2. Fixed at build time.
const basePath = normalizeBasePath(process.env.BASE_PATH);

const config: NextConfig = {
  // Self-contained build (server.js + minimal node_modules) so the server never runs npm or next build.
  output: "standalone",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  allowedDevOrigins: ["103.6.207.2"],
  async redirects() {
    return [{ source: "/display", destination: "/", permanent: false }];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
    ] }];
  },
};
export default config;
