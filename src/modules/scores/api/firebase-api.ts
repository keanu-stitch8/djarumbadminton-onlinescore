import "server-only";
import { GoogleAuth } from "google-auth-library";
import { DataSourceError, fetchJson } from "@/lib/server/http-client";

let auth: GoogleAuth | undefined;

async function getAuthHeaders(): Promise<HeadersInit> {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!keyFile && !json) return {};
  try {
    auth ??= new GoogleAuth({
      ...(json ? { credentials: JSON.parse(json) } : { keyFile }),
      scopes: ["https://www.googleapis.com/auth/firebase.database", "https://www.googleapis.com/auth/userinfo.email"],
      clientOptions: { transporterOptions: { timeout: 10_000, retry: false } },
    });
    const token = await auth.getAccessToken();
    if (!token) throw new Error("No token");
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    const detail = error as { code?: unknown; cause?: { code?: unknown }; response?: { status?: unknown; data?: { error?: unknown } } };
    const rawCode = detail?.code ?? detail?.cause?.code;
    const code = typeof rawCode === "string" && /^[A-Z0-9_]{1,48}$/.test(rawCode) ? rawCode : "unknown";
    const status = typeof detail?.response?.status === "number" ? detail.response.status : "unknown";
    const rawOAuth = detail?.response?.data?.error;
    const oauth = typeof rawOAuth === "string" && ["invalid_grant", "invalid_client", "unauthorized_client", "invalid_scope", "access_denied"].includes(rawOAuth) ? rawOAuth : "unknown";
    console.warn(`[scores] Firebase authentication failed: code=${code}, status=${status}, oauth=${oauth}`);
    throw new DataSourceError("unauthorized");
  }
}

export function firebaseFeedPath(): string {
  return process.env.FIREBASE_DATABASE_PATH ?? "bdmntn-jati";
}

export async function fetchFirebaseScores(): Promise<unknown> {
  const base = process.env.FIREBASE_DATABASE_URL ?? "https://livescore-bdmntn-default-rtdb.asia-southeast1.firebasedatabase.app";
  const path = firebaseFeedPath();
  let url: URL;
  try {
    url = new URL(base);
    if (url.protocol !== "https:" || !/\.(firebasedatabase\.app|firebaseio\.com)$/.test(url.hostname) || url.username || url.password) throw new Error();
    url.pathname = `/${path.split("/").filter(Boolean).map(encodeURIComponent).join("/")}.json`;
    url.search = "";
  } catch { throw new DataSourceError("configuration"); }
  return fetchJson(url, await getAuthHeaders());
}
