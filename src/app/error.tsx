"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="state-panel"><h1>Halaman belum dapat dimuat</h1><p>Silakan coba memuat halaman kembali.</p><Button onClick={reset}>Coba lagi</Button></main>;
}
