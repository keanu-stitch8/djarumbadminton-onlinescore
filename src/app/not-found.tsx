import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/state-panel";

export default function NotFound() {
  return <StatePanel as="main" heading="h1" title="Halaman tidak ditemukan" action={<Button asChild><Link href="/">Lihat skor</Link></Button>}>Kembali untuk melihat skor pertandingan.</StatePanel>;
}
