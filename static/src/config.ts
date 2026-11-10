// Firebase source, fixed at build time. Override with VITE_FIREBASE_DATABASE_URL / VITE_FIREBASE_DATABASE_PATH.
// Only works while the database rules allow public reads: a static site cannot hold credentials.
const base = import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://livescore-bdmntn-default-rtdb.asia-southeast1.firebasedatabase.app";
export const feedPath = import.meta.env.VITE_FIREBASE_DATABASE_PATH || "bdmntn-jati";

function buildStreamUrl(): string {
  const url = new URL(base);
  if (url.protocol !== "https:" || !/\.(firebasedatabase\.app|firebaseio\.com)$/.test(url.hostname) || url.username || url.password) {
    throw new Error("VITE_FIREBASE_DATABASE_URL must be an https Firebase Realtime Database URL");
  }
  url.pathname = `/${feedPath.split("/").filter(Boolean).map(encodeURIComponent).join("/")}.json`;
  url.search = "";
  return url.toString();
}

export const streamUrl = buildStreamUrl();
