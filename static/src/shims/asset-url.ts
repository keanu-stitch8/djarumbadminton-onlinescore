// Shared components use root paths like "/logos/bwf.png". The static build uses a relative base,
// so the site works from any folder on the web server (e.g. https://host/onlinescore/).
export function assetUrl(path: string): string {
  return path.startsWith("/") ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path;
}
