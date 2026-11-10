import "server-only";
import { cache } from "react";
import { DataSourceError } from "@/lib/server/http-client";
import { getScoreboardData } from "../services/scores-service";
import type { ScoreboardResult } from "../types/scores";

const messages: Record<string, string> = {
  configuration: "Konfigurasi sumber skor belum lengkap.",
  unauthorized: "Akses sumber skor belum tersedia. Periksa kredensial Firebase pada server.",
  missing: "Sumber skor belum ditemukan.",
  invalid: "Format data skor belum dapat dibaca.",
  unavailable: "Sumber skor belum dapat dihubungi. Kami akan mencoba kembali otomatis.",
  socket: "Koneksi/socket ke Firebase terputus. Aplikasi sedang mencoba tersambung kembali.",
  timeout: "Firebase belum merespons dalam batas waktu. Aplikasi akan mencoba kembali otomatis.",
};

export const getScoreboardQuery = cache(async (): Promise<ScoreboardResult> => {
  try { return { ok: true, data: await getScoreboardData() }; }
  catch (error) {
    const code = error instanceof DataSourceError ? error.code : "unavailable";
    console.warn(`[scores] Firebase read failed: ${code}`);
    return { ok: false, code, message: messages[code] };
  }
});
