// The app can live under a sub-path behind a reverse proxy (e.g. /mlijis-2026/venue2), set at build
// time with BASE_PATH (next.config.ts exposes it as NEXT_PUBLIC_BASE_PATH). Next.js prefixes <Link>
// and /_next assets itself, but not fetch() URLs or string `src` values of next/image.

export function normalizeBasePath(value: string | undefined): string {
  const segments = (value ?? "").trim().split("/").filter(Boolean);
  return segments.length ? `/${segments.join("/")}` : "";
}

export function prefixPath(basePath: string, path: string): string {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}

export function withBasePath(path: string): string {
  return prefixPath(process.env.NEXT_PUBLIC_BASE_PATH ?? "", path);
}
