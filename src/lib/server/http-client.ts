import "server-only";

export class DataSourceError extends Error {
  readonly code: "configuration" | "unauthorized" | "unavailable" | "invalid" | "missing" | "socket" | "timeout";

  constructor(code: DataSourceError["code"]) {
    super(code);
    this.code = code;
    this.name = "DataSourceError";
  }
}

export async function fetchJson(url: URL, headers: HeadersInit = {}): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    const socketCodes = new Set(["UND_ERR_SOCKET", "ECONNRESET", "ECONNREFUSED", "EPIPE", "ENOTFOUND", "EAI_AGAIN", "ENETUNREACH", "EHOSTUNREACH"]);
    const timeoutCodes = new Set(["ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_BODY_TIMEOUT"]);
    // Inspect only known names/codes. Never return upstream messages, URLs or credentials.
    let current: unknown = error;
    for (let depth = 0; depth < 4 && typeof current === "object" && current !== null; depth++) {
      const detail = current as { name?: unknown; code?: unknown; cause?: unknown };
      if (detail.name === "TimeoutError" || (typeof detail.code === "string" && timeoutCodes.has(detail.code))) throw new DataSourceError("timeout");
      if (typeof detail.code === "string" && socketCodes.has(detail.code)) throw new DataSourceError("socket");
      current = detail.cause;
    }
    throw new DataSourceError("unavailable");
  }
  if (response.status === 401 || response.status === 403) throw new DataSourceError("unauthorized");
  if (!response.ok) throw new DataSourceError("unavailable");
  try { return await response.json(); } catch { throw new DataSourceError("invalid"); }
}
