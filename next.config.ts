import type { NextConfig } from "next";
import { normalizeBasePath } from "./src/lib/base-path";

// Optional sub-path when served behind a reverse proxy (env BASE_PATH, e.g. /mlijis-2026/venue2).
// Unset = served at the root. Must be the same for `next build` and `next start`.
const basePath = normalizeBasePath(process.env.BASE_PATH);

const config: NextConfig = {
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
