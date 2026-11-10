"use client";

import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/state-panel";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <StatePanel as="main" heading="h1" title="Halaman belum dapat dimuat" action={<Button className="mt-[7px]" onClick={reset}>Coba lagi</Button>}>Silakan coba memuat halaman kembali.</StatePanel>;
}
