import "server-only";

/**
 * Process-wide cache for one async value: a successful result is reused for `ttlMs`
 * (counted from when the load finished), and concurrent callers share one in-flight load.
 * Failures are never cached, so the next call retries immediately.
 */
export function createCachedLoader<T>(load: () => Promise<T>, ttlMs: number, now: () => number = Date.now): () => Promise<T> {
  let cached: { value: T; expiresAt: number } | undefined;
  let inFlight: Promise<T> | undefined;

  return () => {
    if (cached && now() < cached.expiresAt) return Promise.resolve(cached.value);
    inFlight ??= load()
      .then((value) => {
        cached = { value, expiresAt: now() + ttlMs };
        return value;
      })
      .finally(() => { inFlight = undefined; });
    return inFlight;
  };
}
